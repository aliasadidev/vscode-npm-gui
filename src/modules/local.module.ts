import * as fs from 'fs/promises';
import AdmZip = require('adm-zip');
import {
  PackageMetadata,
  PackageVersion,
  SearchPackageResultVersion,
  ServerPackageSearchResult,
} from '../models/nuget.model';
import { PackageSource, SourceType } from '../models/option.model';
import { xml2js } from './xml2js';
import admZip = require('adm-zip');
import { Element } from '../models/xml.model';
import { findNugetPackageFiles } from '../services/nupkg.service';
import { mergeList } from './utils';
import { fileTypeFromBuffer } from 'file-type';
import { sortVersions } from '../services/version.service';

async function readNuspecFile(zip: AdmZip): Promise<PackageMetadata | null> {
  const zipEntries = zip.getEntries();
  for (const zipEntry of zipEntries) {
    if (zipEntry.name.endsWith('.nuspec')) {
      const nuspecXml = zipEntry.getData().toString('utf8');
      let result: Element | undefined;
      try {
        result = await xml2js(nuspecXml, {});
      } catch (error: any) {
        console.error(
          `Failed to parse nuspec XML from ${zipEntry.name}: ${error.message}`
        );
        return null;
      }

      const packageTag: Element | undefined = result?.elements?.find(
        x => x.name == 'package'
      );

      const metadataTag: Element | undefined = packageTag?.elements?.find(
        x => x.name == 'metadata'
      );

      function getKey(key: string) {
        return (
          metadataTag?.elements
            ?.find(x => x.name == key)
            ?.elements?.find(x => x.type == 'text')
            ?.text?.toString() ?? ''
        );
      }

      const authors = getKey('authors');
      const tags = getKey('authors');
      const version = getKey('version');

      const icon = getKey('icon');
      let iconUrl = getKey('iconUrl');
      if (icon && !iconUrl) {
        const fileContent = zipEntries.find(x => x.name == icon);
        const buffer = fileContent?.getData();
        // Detect the file type
        if (fileContent && buffer) {
          const type = await fileTypeFromBuffer(buffer);
          if (type) {
            iconUrl = `data:${type.mime};base64,${buffer.toString('base64')}`;
          }
        }
      }

      const metadata: PackageMetadata = {
        id: getKey('id'),
        version: version,
        versions: [{ downloads: 0, version: version }],
        title: getKey('title'),
        authors: authors ? authors.split(',') : [],
        licenseUrl: getKey('licenseUrl'),
        projectUrl: getKey('projectUrl'),
        iconUrl: iconUrl,
        registration: getKey('registration'),
        description: getKey('description'),
        summary: getKey('summary'),
        totalDownloads: 0,
        packageTypes: [],
        verified: getKey('verified') === 'true',
        stableVersion: undefined,
        tags: tags ? tags.split(',') : [],
      };
      return metadata;
    }
  }
  return null;
}

export async function localSearchPackage(
  packageSources: PackageSource[],
  query: string,
  take?: number | null,
  skip?: number | null
): Promise<ServerPackageSearchResult[]> {
  const searchResult: ServerPackageSearchResult[] = [];

  const metadataPromises: Promise<PackageMetadata>[] = findNugetPackageFiles(
    packageSources
      .filter(
        x =>
          x.sourceType.toString() === SourceType[SourceType.local] &&
          x.sourceDirectory
      )
      .map(x => x.sourceDirectory)
  )
    .map(async (file: string) => {
      const buffer = await fs.readFile(file);
      const zip = new admZip(buffer);
      return readNuspecFile(zip);
    })
    .filter(metadata => metadata !== null) as Promise<PackageMetadata>[];

  const allMetadata = await Promise.all(metadataPromises);

  const packages: Record<string, PackageMetadata> = {};

  for (let index = 0; index < allMetadata.length; index++) {
    const element = allMetadata[index];
    if (packages[element.id]) {
      const versions: string[] = mergeList([
        ...packages[element.id].versions.map(x => x.version),
        ...element.versions.map(x => x.version),
      ]);
      packages[element.id].versions = sortVersions(versions).map(x => ({
        downloads: 0,
        version: x,
      }));
    } else {
      packages[element.id] = element;
    }
  }
  let res = Object.values(packages);
  if (query && query !== '') {
    res = res.filter(x => x.id.indexOf(query) !== -1);
  }

  searchResult.totalHits = res.length;

  if (take != null && skip != null) {
    res = res.splice(skip, take);
  }

  searchResult.data = res;

  return searchResult;
}

export async function localGetPackageVersions2(
  sourceDirectory: string[],
  packageName: string,
  packageSource: PackageSource
): Promise<PackageVersion> {
  var localSearch = await localSearchPackage(
    sourceDirectory,
    packageName,
    packageSource,
    null,
    null
  );
  const metadata: PackageMetadata | undefined = localSearch.data.find(
    (metadata: PackageMetadata) => metadata.id === packageName
  );
  const versions: string[] = metadata
    ? metadata.versions?.map(
        (spr: SearchPackageResultVersion) => spr.version
      ) ?? []
    : [];

  var packageVersion: PackageVersion = {
    packageName: packageName,
    versions: versions,
    sourceName: packageSource.sourceName,
    sourceId: packageSource.id,
  };

  return Promise.resolve<PackageVersion>(packageVersion);
}

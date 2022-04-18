import { expect } from 'chai';
import { findStableVersion } from '../../../services/version.service';



suite('common.service.ts tests', () => {

  const versionListTestCases = [
    {
      actualValue: [
        '1.0.1',
        '1.1.1',
        '0.0.1'
      ],
      expectedValue: '1.1.1'
    },
    {
      actualValue: [
        '1.0.1',
        '1.1.1-beta',
        '0.0.1'
      ],
      expectedValue: '1.0.1'
    },
    {
      actualValue: [
        '5.5.1',
        '4.21.0',
        '4.22.0',
        '6.1.0',
        '5.1.0',
        '3.0.1',
        '4.5.0-nnn',
        '4.5.0.1',
        '3.0',
        '3',
        '11.0.beta2',
        '11.0.beta1',
        '6.1.0.154564',
        '6.1.0.154564b'
      ],
      expectedValue: '6.1.0.154564'
    },
    {
      actualValue: [
        '1.2.0',
        '1.2.0-rc.3',
        '1.2.5',
        '1.2.0-b.2',
        '1.2.0-a.1',
      ],
      expectedValue: '1.2.5'
    },
    {
      actualValue: [
        '1.11.0',
        '1.9.0',
        '1.10.0',
      ],
      expectedValue: '1.11.0'
    },
    {
      actualValue: [
        '1.0.0-alpha',
        '1.0.0-alpha.1',
        '1.0.0-0.3.7',
        '1.0.0-x.7.z.92',
        '1.0.0-x.7.z.91',
      ],
      expectedValue: '1.0.0-x.7.z.92',
    },
    {
      actualValue: [
        '1.0.0-alpha',
        '1.0.0-alpha.1',
        '1.0.0-alpha.beta',
        '1.0.0-beta',
        '1.0.0-beta.2',
        '1.0.0-beta.11',
        '1.0.0-rc.1',
        '1.0.0'
      ],
      expectedValue: '1.0.0'
    },
    {
      actualValue: [
        '1.0.0-alpha',
        '1.0.0-alpha.1',
        '1.0.0-alpha.beta',
        '1.0.0-rc.1',
        '1.0.0-beta',
        '1.0.0-beta.2',
        '1.0.0-beta.11',
      ],
      expectedValue: '1.0.0-rc.1'
    },
    {
      actualValue: [
        '1.0.0-beta0007',
        '1.0.0-beta0006',
        '1.0.0-beta0005',
        '1.0.0-beta0008',
        '1.0.0-beta0004',
        '1.0.0-beta0003',
        '1.0.0-beta0002',
        '0.1.0-alpha0002',
        '0.1.0-alpha0001',
      ],
      expectedValue: '1.0.0-beta0008'
    },
    {
      actualValue: [
        '7.0.0-preview.2.22153.1',
        '7.0.0-preview.1.22076.6',
        '6.0.3',
        '6.0.2',
        '6.0.1',
        '6.0.0',
        '6.0.0-rc.2.21480.5',
        '6.0.0-rc.1.21452.10',
        '6.0.0-preview.7.21378.4',
        '6.0.0-preview.6.21352.1',
        '6.0.0-preview.5.21301.9',
        '6.0.0-preview.4.21253.1',
        '6.0.0-preview.3.21201.2',
        '6.0.0-preview.2.21154.2',
        '6.0.0-preview.1.21102.2',
      ],
      expectedValue: '6.0.3'
    },
    {
      actualValue: [
        '7.0.0-preview.1.22076.6',
        '6.0.0-rc.2.21480.5',
        '6.0.0-rc.1.21452.10',
        '6.0.0-preview.7.21378.4',
        '6.0.0-preview.6.21352.1',
        '7.0.0-preview.2.22153.1',
        '6.0.0-preview.5.21301.9',
        '6.0.0-preview.4.21253.1',
        '6.0.0-preview.3.21201.2',
        '6.0.0-preview.2.21154.2',
        '6.0.0-preview.1.21102.2',
      ],
      expectedValue: '7.0.0-preview.2.22153.1'
    },
    {
      actualValue: [
        '1.0.0.18456',
        '1.0.0.18454',
        '1.0.0.18457',
        '1.0.0.18453'
      ],
      expectedValue: '1.0.0.18457'
    }
  ];
  versionListTestCases.forEach(({ actualValue, expectedValue }) => {
    test(`should be the same given [${actualValue}] : expected :(${expectedValue}) values`, () => {
      var version = findStableVersion(actualValue);
      expect(expectedValue).to.equal(version);
    });
  });

});

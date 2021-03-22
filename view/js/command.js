//  global 
const Tabs = { "ProjectContainer": 1, "InstallerContainer": 2 };
const columns = [
    "Package Name",
    "Installed Version",
    "Versions",
    "Is Updated",
    "Newer Version",
    "Actions"
];
let fullload = false;

function onInit() {
    command('nugetpackagemanagergui.getdata', function (res) {
        if (res.result) {
            const projects = res.result;
            $("#project-list").html("");
            for (const key in projects) {
                const project = projects[key];
                const projectListItem = `
                        <a class="dropdown-item" href="#" onClick="$('.item-select').text(this.innerHTML)
                                            .attr('project-id','${project.id}')
                                            .removeClass('text-danger');
                        ">${project.projectName}</a>
                    `;
                $("#project-list").append(projectListItem);
            }
        }
    });
}

function toggleTab(tab) {
    switch (tab) {
        case Tabs.ProjectContainer: {
            $("#project-container-tab").click();
            break;
        }
        case Tabs.InstallerContainer: {
            $("#installer-container-tab").click();
            break;
        }
        default: {
            throw "aggruemnt exception Tabs enum:" + tab;
        }
    }
}

function initMainView() {
    command('nugetpackagemanagergui.getdata', function (res) {
        if (res.result)
            createProjectTable(res.result);
    });
}

function createProjectTable(projects) {
    $("#project-container-tables").html("");

    for (let projIndex = 0; projIndex < projects.length; projIndex++) {
        let colIndex = 0;
        let currnetProj = projects[projIndex];
        let packages = currnetProj.packages;

        const tableName = `table-${currnetProj.id}`;
        $("#project-container-tables").append(`<table id="${tableName}"></table>`);

        const colSpan = columns.length - 1;
        const tableHeader = `
        <thead>
        <tr>
            <th colspan="1">Project Name</th>
            <th colspan="${colSpan}" style="text-align: left;">${currnetProj.projectName}</th>
        </tr>
        <tr>
            <th colspan="1">Project Path</th>
            <th colspan="${colSpan}" style="text-align: left;">${currnetProj.projectPath}</th>
        </tr>
        <tr>
            <th style="width:30%;">${columns[colIndex++]}</th>
            <th style="width:10%;">${columns[colIndex++]}</th>
            <th style="width:10%;">${columns[colIndex++]}</th>
            <th style="width:10%;">${columns[colIndex++]}</th>
            <th style="width:10%;">${columns[colIndex++]}</th>
            <th style="width:30%;">${columns[colIndex]}</th>
        </tr>
        </thead>
        `;

        $(`#${tableName}`).append(tableHeader);

        if (packages.length > 0) {
            for (let i = 0; i < packages.length; i++) {
                const pkg = packages[i];
                let versions = pkg.versionList;

                let optionVersions = "";
                for (let index = 0; index < versions.length; index++) {
                    const element = versions[index];
                    optionVersions += `<option value="${element}"  ${element == pkg.newerVersion ? "selected" : ""}>${element}</option>`;
                }

                const knownVersion = pkg.newerVersion !== "Unknown";
                const updateStatus = pkg.isUpdated && knownVersion ? "Yes" : knownVersion ? "No" : "Unknown";
                const updateStatusStyle = pkg.isUpdated && knownVersion ? "success" : knownVersion ? "danger" : "secondary";
                const rowID = `${tableName}_Row${i}`;

                let packageRow = `
                <tr id="${rowID}" class="tr-package">
                    <td>${pkg.packageName}</td>
                    <td>${pkg.packageVersion}</td>
                    <td><select name="versionList" class="versions-option">${optionVersions}</select></td>
                    <td><span class="badge badge-${updateStatusStyle}">${updateStatus}</span></td>
                    <td>${pkg.newerVersion}</td>
                    <td>
                    <button type="button" onclick='update(${currnetProj.id},"${pkg.packageName}","${rowID}")' class='btn btn-default-sm btn-sm'>Update</button>
                    <button type="button" onclick='updateAll(${currnetProj.id},"${pkg.packageName}","${rowID}")' class='btn btn-default-sm btn-sm'>Update All</button>
                    <button type="button" onclick='remove(${currnetProj.id},"${pkg.packageName}","${rowID}")' class='btn btn-default-sm btn-sm'>Remove</button>
                    <button type="button" onclick='removeAll(${currnetProj.id},"${pkg.packageName}")' class='btn btn-default-sm btn-sm'>Remove All</button>
                    </td>
                </tr>
                `;

                $(`#${tableName}`).append(packageRow);
            }
        } else {
            $(`#${tableName}`).append(`<tr class='tr-package'><td colspan='6' class='empty-table'>This project hasn't any package</td></tr>`);
        }
    }
}

function reload(loadVersion, callback) {
    const msg = loadVersion ? "Loading package versions from Nuget server..." : "Loading projects...";
    loading("show", msg);
    $("#project-container-tables").html("");

    command('nugetpackagemanagergui.reload', { LoadVersion: loadVersion }, function (res) {

        createProjectTable(res.result);
        loading("hide");

        if (typeof callback == "function")
            callback(res.result);

        if (fullload === false && loadVersion)
            fullload = true;
    });

    if (loadVersion)
        toggleTab(Tabs.ProjectContainer);
}

function getSelectedVersion(rowID) {
    const row = document.getElementById(rowID);
    const versionOptions = row.querySelector('[name="versionList"]');
    const selectedVersion = versionOptions.value;
    return selectedVersion;
}

function createVersionOptions(versions) {
    let optionVersion = "";
    for (let index = versions.length - 1; index >= 0; index--) {
        const element = versions[index].version;
        optionVersion += `<option value="${element}" >${element}</option>`;
    }
    return optionVersion;
}

// on init
reload(false, (res) => {
    onInit(res);
    toggleTab(Tabs.ProjectContainer);
});
// end global


// start user events
function closeTab() {
    command('nugetpackagemanagergui.close');
}

function install(packageName) {
    loading("show", "Installing...");
    const selectedVersion = document.getElementById(`in_${packageName}`).value;
    const projectID = $(".item-select").attr("project-id");

    if (projectID) {
        command('nugetpackagemanagergui.installPackage', { ID: parseInt(projectID), PackageName: packageName, SelectedVersion: selectedVersion }, function () {
            initMainView();
            loading("hide");
        });
    } else {
        command('nugetpackagemanagergui.showMessage', { Message: "The target project isn't selected, select your target project from the drop-down beside the 'search' button.", Type: "error" }, function () { })
        loading("hide");
    }
}

function update(id, packageName, rowID) {
    const selectedVersion = getSelectedVersion(rowID);
    command('nugetpackagemanagergui.updatePackage', { ID: id, PackageName: packageName, SelectedVersion: selectedVersion }, function () {
        initMainView();
    });
}

function remove(id, packageName, rowID) {
    const selectedVersion = getSelectedVersion(rowID);
    command('nugetpackagemanagergui.removePackage', { ID: id, PackageName: packageName, SelectedVersion: selectedVersion }, function () {
        initMainView();
    });
}

function updateAll(id, packageName, rowID) {
    const selectedVersion = getSelectedVersion(rowID);
    command('nugetpackagemanagergui.updateAllPackage', { ID: id, PackageName: packageName, SelectedVersion: selectedVersion }, function () {
        initMainView();
    });
}

function updateAllProjects() {
    if (fullload === false) {
        reload(true, () => {
            command('nugetpackagemanagergui.updateAllProjects', {}, function () {
                initMainView();
            });
        });
    } else {
        command('nugetpackagemanagergui.updateAllProjects', {}, function () {
            initMainView();
        });
    }
}

function removeAll(id, packageName) {
    command('nugetpackagemanagergui.removeAllPackage', { ID: id, PackageName: packageName }, function () {
        initMainView();
    });
}

function searchPackage() {
    loading("show", "Searching...");
    const searchValue = $("#search-input").val();
    command('nugetpackagemanagergui.searchPackage', { Query: searchValue }, function (response) {
        const result = response.result;
        $("#search-result").html("");

        if ((result && result.data instanceof Array && result.data.length > 0)) {
            for (const key in result.data) {
                const pkg = result.data[key];
                const optionVersion = createVersionOptions(pkg.versions);

                let packageRow = `
                        <tr class='tr-package'>
                            <td style="vertical-align: middle;">${parseInt(key) + 1}</td>
                            <td>
                                <strong >${pkg.id}</strong>
                                <strong style="float: right;">Total Downloads: ${numberWithCommas(pkg.totalDownloads)}</strong> 
                                <p>
                                    ${pkg.description}
                                </p>
                            </td>
                            <td class="text-center">
                            <select id='in_${pkg.id}' class='versions-option'>${optionVersion}</select>
                            <button style="margin-top: 5px;" type="button" onclick='install("${pkg.id}")' class='btn btn-default-sm btn-sm'>Install</button>
                            </td>
                        </tr>
                        `;

                $("#search-result").append(packageRow);
            }
        }
        else {
            $("#search-result").append(`<tr class='tr-package'><td colspan='3' class='empty-table'>0 packages returned for ${searchValue}</td></tr>`);
        }

        loading("hide");
    });
}

// end user events
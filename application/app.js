const translate = navigator.mozL10n.get;

window.addEventListener("load", function () {
    console.log("ALLA");

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "Backspace":
            case "SoftLeft":
            case "q":
            case "SoftRight":
            case "e":
                if (checkMenu()) {
                    e.preventDefault();
                    closeMenu();
                    return;
                }
            case "Enter":
                if (checkMenu()) {
                    return;
                }
        }
        switch (e.key) {
            case "SoftLeft":
            case "q":
                onClick_Menu();
                break;
            case "SoftRight":
            case "e":
                window.close();
                break;
            case "Enter":
                onClick_Enter();
                break;
            case "*":
                // onClick_Test();
                break;
        }
    });

    focusable.setScrollEl(document.getElementById("Items"));
    focusable.initDis = 0;
    focusable.distanceToCenter = true;

    loadData_Apps();
});

const mMenuItems = ["backup_internal", "backup_external", "uninstall"];

const checkMenu = () => {
    if (mMenu) {
        return true;
    }
    return false;
};

const checkFocus = () => {
    if (mMenu) {
        focusable.limitingEl = mMenu;
        let items = mMenu.querySelector(".Items");
        if (!items.children.length) {
            mMenuItems.forEach((o) => {
                let view = document.createElement("div");
                view.classList.add("Item");
                view.setAttribute("focusable", "");
                view.innerText = translate(o);
                view.addEventListener("click", () => {
                    onItemClick_Menu(o);
                });
                items.appendChild(view);
            });
        }
        let item = items.querySelector(".Item");
        item && focusable.requestFocus(item);
    } else {
        focusable.limitingEl = null;
        if (mItem) {
            focusable.requestFocus(mItem.view);
        } else {
            let firstEl = document.querySelector("[focusable]");
            firstEl && focusable.requestFocus(firstEl);
        }
    }
};

const closeMenu = () => {
    mMenu.classList.add("hidden");
    mMenu = null;
    checkFocus();
};

const onClick_Menu = () => {
    if (mMenu) {
        return;
    }
    mMenu = document.getElementById("Menu");
    mMenu.classList.remove("hidden");
    if (mItem) {
        mMenu.querySelector(".Title").innerText = mItem.name;
    }
    checkFocus();
};

const onItemClick_Menu = (type) => {
    if (!mMenu) {
        return;
    }
    switch (type) {
        case "backup_internal":
            onClick_Copy(false);
            break;
        case "backup_external":
            onClick_Copy(true);
            break;
        case "uninstall":
            onClick_Uninstall();
            break;
    }
    closeMenu();
};

const onClick_Enter = () => {
    if (!mItem) {
        return;
    }
    mItem.mozApp.launch();
};

const onClick_Uninstall = () => {
    if (!mItem || mItem.uninstalled) {
        return;
    }
    let b = confirm(translate("confirm_uninstall") + ` ${mItem.name} ？`);
    if (b) {
        let request = navigator.mozApps.mgmt.uninstall(mItem.mozApp);
        // request.onsuccess = (result) => {
        //     console.log(result);
        //     alert("卸载成功");
        // };
        // request.onerror = (error) => {
        //     console.log(error);
        //     alert("卸载失败");
        // };
        mItem.uninstalled = true;
        mItem.view.classList.add("Uninstalled");
        mItem.view.removeAttribute("focusable");
        // document.getElementById("Items").removeChild(mItem.view);
    }
};

function pickUpAppIconInProperSize(e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 56;
    return e[
        Object.keys(e).sort(function (e, n) {
            return (e - n) * (e >= t ? 1 : -1);
        })[0]
    ];
}

const getAppIconUrl = (e, t, n) => {
    if (((t = t || e.manifest.icons), !t)) return null;
    var i = pickUpAppIconInProperSize(t, n);
    return /^(http|data)/.test(i) || (i = e.origin + i), i;
};

let mLoaded = false;
let mItem = null;
let mLoading = false;
let mMenu = null;

const loadData_Apps = () => {
    if (mLoaded) {
        return;
    }
    let items = document.getElementById("Items");
    let result = navigator.mozApps.mgmt.getAll();
    result.onsuccess = (result) => {
        mLoaded = true;
        let apps = result.target.result.reverse();
        console.log(apps);
        apps.forEach((o, index) => {
            let item = {
                icon: getAppIconUrl(o),
                name: o.manifest.name,
                description: o.manifest.description,
                type: o.manifest.type,
                origin: o.origin,
                version: o.manifest.version,
                role: o.manifest.role,
                developer: o.manifest.developer,
                mozApp: o,
            };
            let developer = item.developer && item.developer.name;
            let view = document.createElement("div");
            view.classList.add("Item", "flex-h");
            view.setAttribute("focusable", "");
            if (index == 0) {
                view.addEventListener("up", () => {
                    focusable.requestFocus(items.children[items.children.length - 1]);
                });
            } else if (index == apps.length - 1) {
                view.addEventListener("down", () => {
                    focusable.requestFocus(items.children[0]);
                });
            }
            view.innerHTML = `
                <img class="Icon" src="${item.icon}"/>
                <div class="View2 flex-v flex-1">
                    <div class="Name">${item.name}</div>
                    ${developer ? `<div class="Developer">${developer}</div>` : ""}
                    <div class="Description">${item.description}</div>
                    <div class="Type">${[item.version && "v" + item.version, item.type, item.role].filter((o) => o).join("/")}</div>
                </div>
            `;
            view.addEventListener("onFocus", () => {
                mItem = item;
            });
            item.view = items.appendChild(view);
        });
        checkFocus();
    };
    result.onerror = (error) => {
        console.log("error", error);
    };
    // console.log(apps);
};

const loadData_Apps_Test = () => {
    Array.from({ length: 63 }).forEach((o, index) => {
        let item = {
            icon: "",
            name: "name" + index,
            description: "description1111111111111111111111111111111111111111111" + index,
            type: "type" + index,
        };
        let view = document.createElement("div");
        view.classList.add("Item", "flex-h");
        view.setAttribute("focusable", "");
        view.innerHTML = `
            <img class="Icon" src="${item.icon}"/>
            <div class="View2 flex-v flex-1">
                <div class="Name">${item.name}</div>
                <div class="Description">${item.description}</div>
                <div class="Type">${item.type}</div>
            </div>
        `;
        view.addEventListener("onFocus", () => {
            mItem = item;
        });
        document.getElementById("Items").appendChild(view);
    });
};

const onClick_Test = () => {
    console.log(navigator);
};

const onClick_Copy = (isExternal = false) => {
    if (mLoading || !mItem) {
        return;
    }
    let fn = () => {
        mLoading = true;
        let app = mItem.origin.substr(6);
        let newDirectory = `${mItem.name}[${app}]`;
        let [internal, external] = navigator.getDeviceStorages("sdcard").map(a=>a.storagePath); // in theory, 0 is always internal and 1 is always external; 
        let error = () => {
            alert(translate("operation_failed"));
            mLoading = false;
        };
        if (!external && isExternal) return error("operation_failed");
        let path = "/ALLA/apps/";
        let sdcard = (isExternal ? external : internal) + path;
        let cmd1 = `mkdir -p ${sdcard}`;
        let cmd2 = `cp -r /system/b2g/webapps/${app} ${sdcard}`;
        let cmd3 = `cp -r /data/local/webapps/${app} ${sdcard}`;
        let cmd4 = `mv ${sdcard}${app} ${sdcard}${newDirectory}`;
        let cmd = [cmd1, cmd2, cmd3, cmd4];
        let request = navigator.engmodeExtension.startUniversalCommand(cmd.join(";"), true);
        request.onsuccess = (result) => {
            alert(`${translate("backup_to")} ${isExternal ? translate("directory_external") : translate("directory_internal")}${path}${newDirectory}`);
            mLoading = false;
        };
        request.onerror = error;
    };
    if (!isExternal) {
        fn();
        return;
    }
    let sdcard = navigator.getDeviceStorage("sdcard");
    let request0 = sdcard.available();
    request0.onsuccess = (success) => {
        if (success.target.result != "available") {
            alert(translate("invalid_sd"));
            return;
        }
        fn();
    };
    request0.onerror = () => {
        alert(translate("invalid_sd"));
    };
};

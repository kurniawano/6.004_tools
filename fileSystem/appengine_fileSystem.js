// keep jslint happy
//var JSON;
//var console,localStorage;

var FileSystem= (function(){
    var server_url = 'https://computationstructures.appspot.com/';
    var shared_url = 'http://horus.csail.mit.edu/~cjt/cs/tools/';

    function server_request(url,data,callback) {
        $.ajax(server_url+url, {
            type: 'POST',
            dataType: 'json',
            data: data,
            xhrFields: {
                // hopefully there's a session cookie :)
                withCredentials: true
            },
            success: function(response) {
                if (callback) callback(response);
            },
            error: function(jqXHR,status,error) {
                // provide error as a json response
                if (callback) callback({_error: 'Server '+status+' '+error});
            }
        });
    }

    // figure out who user is and let callback know
    function validate_user(callback) {
        // if user has already signed in, life is easy
        var user = sessionStorage.getItem('user');
        if (user !== undefined) {
            callback(user);
            return;
        }

        function complete_signin(dialog) {
            var user = dialog.inputContent(0);
            var password = dialog.inputContent(1);

            // a successful validation will set a session cookie that will
            // passed to the server on subsequent ajax calls.
            server_request('/user/validate',
                           {'_user': user,'_password': password},
                           function (response) {
                               if (response._error === undefined) {
                                   dialog.dismiss();
                                   sessionStorage.setItem('user',user);
                                   callback(user);
                               } else {
                                   dialog.showError(response._error);
                                   // leave dialog show and let user try again
                               }
                           });
        }

        // pop up dialog to let user sign in
        var dialog = new ModalDialog();
        dialog.setTitle("Sign In");
        dialog.inputBox({label: "Email", type: 'email', callback: complete_signin});
        dialog.inputBox({label: "Password", type: 'password', callback: complete_signin});
        dialog.addButton("Dismiss", "dismiss");
        dialog.addButton("Submit", function(){complete_signin(dialog);}, 'btn-primary');
        dialog.show();
    }

    // build required tree from list of filenames
    function build_tree(flist,root_name) {
        var root = {name: root_name || '???', path: '', folders: {}, files: {}};

        $.each(flist,function (index,fname) {
            // current folder starts at the root
            var dir = root;

            // process each component of hierarchical file name, creating any missing
            // directories as we descend from the root.  Last component is the file name...
            var components = fname.split("/");
            $.each(components,function (nindex,name) {
                if (nindex == components.length - 1) {
                    // last component is the file name, add to current folder
                    dir.files[name] = {name: name, path: dir.path + '/' + name};
                } else {
                    // see if already have a (sub)folder of this name
                    var child = dir.folders[name];
                    if (child === undefined) {
                        // if not create a new folder, save in parent
                        child = {name: name, path: dir.path + '/' + name, folders: {}, files: {}};
                        dir.folders[name] = child;
                    }
                    // descend a level in the folder tree
                    dir = child;
                }
            });
            
        });

        return root;
    }

    function getFileList(succeed,fail) {
        // first step: validate the user with the server
        validate_user(function(user) {
            server_request('file/',
                           {'action': 'list'},
                           function (response) {
                               if (response._error === undefined) {
                                   var tree = build_tree(response.list);
                                   succeed(tree,sessionStorage.getItem('user'));
                               } else {
                                   if (fail) fail(response._error);
                               }
                           });

        });
    }

    function getSharedFileList(succeed,fail) {
        $.ajax(shared_url+'shared.json', {
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                var tree = build_tree(response.list,'shared');
                succeed(tree);
            },
            error: function(jqXHR,status,error) {
                if (fail) fail('Server '+status+' '+error);
            }
        });
    }

    function getUserName() {
        return sessionStorage.getItem('user');
    }

    function isFolder() {
    }

    function newFolder() {
    }

    function isFile() {
    }

    function newFile() {
    }

    function deleteFile() {
    }

    function moveFile() {
    }

    function copyFile() {
    }

    function renameFile() {
    }

    function getFile(filename,succeed,fail) {
    }

    function getBackup() {
    }

    function makeAutoSave() {
    }

    function saveFile() {
    }

    return {getFileList: getFileList,
            getSharedFileList: getSharedFileList,
            getUserName: getUserName,

            isFolder: isFolder,
            newFolder: newFolder,

            isFile: isFile,
            newFile: newFile,
            deleteFile: deleteFile,
            moveFile: moveFile,
            copyFile: copyFile,
            renameFile: renameFile,

            getBackup: getBackup,
            getFile: getFile,
            makeAutoSave: makeAutoSave,
            saveFile: saveFile
           };
}());
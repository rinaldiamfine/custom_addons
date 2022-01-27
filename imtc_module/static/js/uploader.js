
$(document).ready(function () {
    var isAdvancedUpload = function() {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();
    
    var $form = $('.drag-box');
    if (isAdvancedUpload) {
        $form.addClass("has-advanced-upload");
        var droppedFiles = false;

        $form.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        })
        .on('dragover dragenter', function() {
            $form.addClass('is-dragover');
        })
        .on('dragleave dragend drop', function() {
            $form.removeClass('is-dragover');
        })
        .on('drop', function(e) {
            console.log(e.originalEvent.dataTransfer.files ,"PILES");
            // var resume = document.getElementById("upload-file");
            GenerateWidgetDraggable(e.originalEvent.dataTransfer.files);
        });
    }
});

function deleteRow(btn, id) {
    var row = btn.parentNode.parentNode;
    var resumelist = document.getElementById("doc-file");
    row.parentNode.removeChild(row);
    if (('FileList_Array' in resumelist)) {
        resumelist.FileList_Array = resumelist.FileList_Array.filter(function(obj) {
            showInformationFiles();
            return obj.id != id+1;
        });
    }
}

function showInformationFiles() {
    var tableFile = $('#table_file tr');
    var informationTab = $('#tile-information-file');
    console.log(tableFile, "GET TAB FLI")
    if (tableFile.length > 0) {
        for (var i=0; i<informationTab.length; i++) {
            informationTab[i].style.display = 'block';
        }
    }
    else {
        for (var i=0; i<informationTab.length; i++) {
            informationTab[i].style.display = 'none';
        }
    }
}

function bytesToSize(bytes) {
    if(bytes == 0) return '0 Bytes';
        var k = 1000,
        dm = 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
};

function getSizeName(bytes) {
    if(bytes == 0) return '0 Bytes';
        var k = 1000,
        dm = 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
        return sizes[i];
};

function  GenerateWidgetDraggable(resumeFile) {
    var id = 0;
    console.log(resumeFile, "RESUME FILES");
    var useBrowse = false;
    var resume = false;
    if (!resumeFile) {
        var resume = document.getElementById("upload-file");
        resumeFile = resume.files;
        useBrowse = true;
    }
    var resumelist = document.getElementById("doc-file");
    if (!('FileList_Array' in resumelist))
    {
        resumelist.FileList_Array = []
    }
    console.log(resumelist, "GET RESUME LIST")
    for(var i = 0 ; i < resumeFile.length ; i++)
    { 
        var file = resumeFile[i]; 
        var size = bytesToSize(file.size);
        var name = getSizeName(file.size);
        var html = '';
        if (file.type == 'application/pdf') {
            html += '<tr><td style="vertical-align: middle; width: -moz-min-content; width: min-content;"><img src="/imtc_module/static/icon/pdf.svg"/></td><td style="vertical-align: middle;">'+file.name+'<br/><small>'+size + ' ' + name+'</small></td><td align="right" style="vertical-align: middle;"><span style="cursor: pointer;" onclick="deleteRow(this,'+id+')"><i class="fa fa-times"></i></span></td></tr>';
        }
        else {
            html += '<tr><td style="vertical-align: middle; width: -moz-min-content; width: min-content;"><img src="/imtc_module/static/icon/image.svg"/></i></td><td style="vertical-align: middle;">'+file.name+'<br/><small>'+size + ' ' + name+'</small></td><td align="right" style="vertical-align: middle;"><span style="cursor: pointer;" onclick="deleteRow(this,'+id+')"><i class="fa fa-times"></i></span></td></tr>';
        }
        id += 1;
        $('#table_file').append(html);
        var reader = new FileReader();
        reader.fileName = file.name;
        reader.fileType = file.type;
        reader.fileDescription = file.description;
        reader.fileLastModified = file.lastModified;
        reader.fileLastModifiedDate = file.lastModifiedDate;
        reader.readAsDataURL(file);
        reader.onload = function(upload) 
        {
            var data = upload.target.result;
            var data64 = data.split(',')[1];
            resumelist.FileList_Array.push({
                'name':upload.target.fileName, 
                'datas_fname':upload.target.fileName,
                'file_type':upload.target.fileType,
                'description':upload.target.fileDescription,
                'lastModified':upload.target.fileLastModified,
                'lastModifiedDate':upload.target.fileLastModifiedDate,
                'datas': String(data64),
                'id': id
            });
        }
    }
    
    if (useBrowse) {
        resume.value = "";
    }
    showInformationFiles();
}
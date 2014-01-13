fs=require('fs')
sourcefolder='bookxml/';
outputfolder='xml/';
lst=fs.readFileSync('./sltp.lst','utf8').replace(/\r\n/g,'\n').split('\n');
titles=require('./titles.json');
titlenow=0;

var newfile=function(fn) {
	console.log('create file',fn)
}

var dofile=function(f) {
	//console.log('processing',f)
	var arr=fs.readFileSync(sourcefolder+f,'utf8').replace(/\r\n/g,'\n').split('\n');
	var out=[];
	var lastpid=0,i=0;
	while(i<arr.length) {
		title=titles[titlenow].caption;
		if (arr[i].toLowerCase().indexOf(title)>-1) {
			newfile(titles[titlenow].id);
			titlenow++;
		}
		i++;
	}
}

lst.map(function(file){dofile(file)});


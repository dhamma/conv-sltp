fs=require('fs')
sourcefolder='bookxml/';
outputfolder='xml/';
lst=fs.readFileSync('./sltp.lst','utf8').replace(/\r\n/g,'\n').split('\n');
titles=require('./titles.json');
titlenow=0;
prevfile="";
var out=[];
var newfile=function(fn) {
	if (prevfile) {
		console.log('saving file',prevfile)
		fs.writeFileSync( outputfolder+prevfile+'.xml',out.join('\n'),'utf8')
		out=[];
	}
	if (!fn) return;
	prevfile=fn;
}
/*
{"id":"s12","caption":"nidānasaṃyuttaṃ"},
*/
var dofile=function(f) {
	//console.log('processing',f)
	var arr=fs.readFileSync(sourcefolder+f,'utf8').replace(/\r\n/g,'\n').split('\n');

	var lastpid=0,i=0;
	while(i<arr.length) {
		if (titlenow<titles.length) {
			title=titles[titlenow].caption;
			if (arr[i].toLowerCase().indexOf(title)>-1) {
				newfile(titles[titlenow].id);
				titlenow++;
			}			
		}

		out.push(arr[i]);
		i++;
	}
	
}

lst.map(function(file){dofile(file)});

newfile();
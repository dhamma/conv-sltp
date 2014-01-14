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
var pagetext=[];
var parseFootnote=function() {
	console.log(pagetext.length)
	if (pagetext.length) out=out.concat(pagetext);
	pagetext=[];
}
var dofile=function(f) {
	//console.log('processing',f)
	var arr=fs.readFileSync(sourcefolder+f,'utf8').replace(/\r\n/g,'\n').split('\n');
	if (out.length && prevfile) {
		newfile(titles[titlenow-1].id);
		prevfile="";
	}
	var lastpid=0,i=0;
	while(i<arr.length) {
		if (titlenow<titles.length) {
			title=titles[titlenow].caption;
			if (arr[i].toLowerCase().indexOf(title)>-1) {
				var id=titles[titlenow].id
				newfile(id);
				out.push('<readunit id="'+id+'">'+arr[i]+'</readunit>')
				titlenow++;
			}	
		}
		if (arr[i].substring(0,5)=='<pb n') parseFootnote();

		pagetext.push(arr[i]);
		i++;
	}
	parseFootnote();
}

lst.map(function(file){dofile(file)});

newfile();
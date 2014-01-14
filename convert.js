fs=require('fs')
sourcefolder='html/';
outputfolder='bookxml/';
lst=fs.readFileSync('./sltp_html.lst','utf8').replace(/\r\n/g,'\n').split('\n');
var filename="";
var replaceEntities=function(line) { 
	// &#7747; &#257;  assume AOT only use decimal entities
	line=line.replace(/&#(.*?);/g,function(m) {
		m=m.substring(2,m.length-1); //trim non digit
		return String.fromCharCode(m);
	});
	return line;
}

var replacePTSpagenumber=function(line) {
	//[<a id='pts.003'><b>PTS Page 003</b></a>] [\q   3/]
	line=line.replace(/\[<a id='pts.(\d+)'><b>PTS Page (\d+)(.*?)(\d+)\/\]     /g,function(m,n1,n2) {
		n1=parseInt(n1,10);
		n2=parseInt(n2,10);
		if (n1!=n2) throw 'page number not match '+n1+'!='+n2+' '+filename+'\n'+line

		return '<pb ed="pts" n="'+n1+'"/>';
	});	
	return line;
}
/*
   DN_II_utf8.htlm line 5588
   AN_IV_utf8.html line 14320
*/
var replaceBJTpagenumber=function(line) {
	//[BJT Page 006] [\x   6/]     
	line=line.replace(/\[BJT Page (\d+).*?(\d+)\/\]     /g,function(m,n1,n2) {
		n1=parseInt(n1,10);
		n2=parseInt(n2,10);
		if (n1!=n2) throw 'page number not match '+n1+'!='+n2+' '+filename+'\n'+line

		return '<pb n="'+n1+'"/>';
	});	
	return line;
}


dofile=function(f){
	console.log('processing',f)
	filename=f;
	var arr=fs.readFileSync(sourcefolder+f,'utf8').replace(/\r\n/g,'\n').split('\n');
	var out=[],toprocess=false;

	i=150;
	while (i<arr.length) {
		i++;
		if (arr[i]=="<div id='COPYRIGHTED_TEXT_CHUNK'><!-- BEGIN COPYRIGHTED TEXT CHUNK -->") {
			toprocess=true;
			i+=2;
		}
		if (toprocess && arr[i]=="</div> <!-- #COPYRIGHTED_TEXT_CHUNK (END OF COPYRIGHTED TEXT CHUNK) -->") toprocess=false;

		if (!toprocess) continue;
		line=arr[i];

		if (line=='<br />&nbsp;<br />') line='<hr/>';
		line=replaceEntities(line);
		line=replaceBJTpagenumber(line);
		line=replacePTSpagenumber(line);
				
		out.push(line)
	}
	f=f.substring(0,f.length-5)+'.xml';
	fs.writeFileSync(outputfolder+f,out.join('\n'),'utf8');
}


lst.map(function(file){dofile(file)});
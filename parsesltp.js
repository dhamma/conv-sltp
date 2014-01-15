fs=require('fs')
sourcefolder='bookxml/';
outputfolder='xml/';
lst=fs.readFileSync('./sltp.lst','utf8').replace(/\r\n/g,'\n').split('\n');


/*
{"id":"s12","caption":"nidānasaṃyuttaṃ"},
s12, s13 different name with VRI
*/
titles=require('./titles.json');


titlenow=0;
prevfile="test",filename="";
var out=[],repeatedpage=[],unparseddigits=[],footnotemismatch=[],skippage=[];

var pagematchcount=0;
var pagetext=[],nextpagenumber=2, footnotes={} 
//"3.1":["1 xx","2 xxx","3"],

var parseFootnoteSection=function() {

}
var parsePage1=function(pagenumber) {
	if (pagenumber && pagenumber!=nextpagenumber) {
		repeatedpage.push(filename+' pb:'+pagenumber);
	}
	nextpagenumber=pagenumber+2;
	output="";
	/*
		check page number
		first parse the number in bodytext , calcuate how many foot note.

		footnote section start from 1 until end of page
	*/
	numbercount=0;
	var expectedfootnote=1;
	firstline=pagetext[0];
	pagetext.shift();
	output=pagetext.join('\n');
	var startfootnote=false;
	var nextfootnote=1;
	//footnote
	output2=output.replace( /(\d+)\./g,function(m,m1,offset) {
		m1=parseInt(m1,10);		
		if (m1==nextfootnote) {
			nextfootnote++;
			return '<f n="'+m1+'"/>';
		}	else {
			if (output[offset-1]=='\n') { //paragraph
				return '<p n="'+m1+'"/>';
			} else {
				return m;		//maybe footnote number before full stop.
			}
			
		}
	})
	totalfootnote=nextfootnote;
	nextfootnote=1;
	//now we have number of footnote, replace the main text
	output3=output2.replace(/(\d+)/g,function(m,m1,offset){
		m1=parseInt(m1,10)
		if (m1==nextfootnote && output2[offset+m.length]!='"') {
			nextfootnote++;
			return '<fn n="'+m1+'"/>';
		} else {
			//unparseddigits.push(filename+'pb '+pagenumber+' '+m1);
			return m;
		}
	})

	//foot note in main page different from foot note section
	if (nextfootnote!=totalfootnote) {
		footnotemismatch.push(filename+'pb '+(pagenumber-2)+' '+(nextfootnote-1)+'!='+(totalfootnote-1));
	} else {
		pagematchcount++;
	}
	
	output4=output3.split('\n');
	output4.unshift(firstline);
	//console.log(pagetext.length)
	if (output4.length) out=out.concat(output4);
	pagetext=[];
}
var parsePage=function(pagenumber) {
	if (pagenumber && pagenumber!=nextpagenumber) {
		repeatedpage.push(filename+' pb:'+pagenumber);
	}
	nextpagenumber=pagenumber+2;

	numbercount=0;
	var expectedfootnote=1;
	output=pagetext.join('\n');
	var footnotesection=false;
	var nextfootnote=1;
	var footnoterefcount=0;
	
	//footnote
	output2=output.replace( /(\d+)/g,function(m,m1,offset) {	
		m1=parseInt(m1,10);
		if (m1==1 && !footnotesection) {
			if (m1!=nextfootnote && output[offset+m.length]=='.') { //start of footnote section
				footnotesection=true;
				footnoterefcount=nextfootnote-1;
				nextfootnote=1;
			}
		}

		leftchar=output[offset-1];
		rightchar=output[offset+m.length];
		include=true;
		
		if (footnotesection) {
			if (m1==nextfootnote) {
				if (nextfootnote==1 && leftchar!='\n') include=false; // first fn must at begin of line

				if (include && output[m.length+offset]=='.') {
					nextfootnote=m1+1;
					return '<f n="'+m1+'"/>';	
				} else {
					return m;
				}					
			} else return m;
		} else { //main text

			if (m1==nextfootnote || m1==nextfootnote-1) { //allow multiple foot note ref n 


				if (leftchar!='\n' && leftchar!='"' && rightchar!='"') {
					nextfootnote=m1+1;
					return '<fn n="'+m1+'"/>';	
				} else {
					return m;
				}
			} else return m;
		}

	});

	if (footnoterefcount!=nextfootnote-1) {
		if (footnoterefcount==0) {
			//no foot note section
			output2=pagetext.join('\n');
			skippage.push(prevfile+' pb '+(pagenumber-2));
		} else{
			footnotemismatch.push(prevfile+' pb '+(pagenumber-2)+' '+(nextfootnote-1)+'!='+(footnoterefcount));
		}
		
	} else {
		pagematchcount++;
	}
	if (output2.length) out=out.concat(output2.split('\n'));
	pagetext=[];

}
var newfile=function(fn) {
	if (prevfile) {
		//console.log('saving file',prevfile)

		fs.writeFileSync( outputfolder+prevfile+'.xml',out.join('\n'),'utf8')
		out=[];
	}
	if (!fn) return;
	prevfile=fn;
}
var dofile=function(f) {
	filename=f;

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
		if (arr[i].substring(0,5)=='<pb n') {
			parsePage( parseInt(arr[i].match(/pb n="(\d+)"/)[1],10) );
		}

		pagetext.push(arr[i]);
		i++;
	}
	parsePage();
	nextpagenumber=2
}

lst.map(function(file){dofile(file)});

newfile();

fs.writeFileSync('repeatedpage.txt',repeatedpage.join('\n'),'utf8');
//fs.writeFileSync('unparseddigits.txt',unparseddigits.join('\n'),'utf8');
fs.writeFileSync('footnotemismatch.txt',footnotemismatch.join('\n'),'utf8');
fs.writeFileSync('skippage.txt',skippage.join('\n'),'utf8');
console.log('page with foot note ',pagematchcount)

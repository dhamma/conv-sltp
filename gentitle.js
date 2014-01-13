fs=require('fs');
arr=fs.readFileSync('./thaititles.txt','utf8').replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
var out=[];
var count=0;
arr.map(function(l){
	if (l.substring(0,9)=='<readunit') {
		count++;
		obj={};

		if (count<35) obj.id='d'+(count);
		else if (count>=35 && count<187) obj.id='m'+(count-34);
		else if (count>=187 && count<243) obj.id='s'+(count-186);

		obj.caption=l.replace(/<.*?>/g,'');
		out.push(JSON.stringify(obj));
	}
})
fs.writeFileSync('titles.txt',out.join(',\n'),'utf8');

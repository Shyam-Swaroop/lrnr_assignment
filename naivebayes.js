var predInputs2=[]; var targets2=[];var examples2=[];var outputs2=[];var unvisited=[];var counter;var rNode;var acc;var cNode;var time=1;var subG;var dbfg="";
var damp=0.8;var probs=[[0.5,0.3,0.2],[0.5,0.3,0.2],[0.5,0.3,0.2],[0.5,0.5],[0.5,0.5],[0.5,0.5],[0.5,0.5],[0.5,0.5]];var pos=0;var neg=0;var poss2=0;var negg2=0;
//Extract feature for one node
function initialFeatureExtractor(node){
	//on insertion into rList
	var parentTaught = 1;  //last time when its parent was taught
	var inTime = 1;  //inTime/time will give us time it entered into the recommended list
	//static features
	var numChildren = node.children.length;  
	var numSiblings = node.numLinkedSiblings.reduce(add,0) + node.numUnlinkedSiblings.reduce(add,0);
	var depth = node.depth;
	var avgSiz = (node.size/node.height)*2;
	var numParents = node.parents.length + node.unlinkedParents.length;
	return {parentTaught:0,inTime:1,numC : numChildren, numS : numSiblings, depth:node.depth, avgSize:avgSiz, numP:numParents};
}

//utility for feature Extractor, provides most recent taught predicate among the list
function mostRecent(nodes){
	var t=-1;
	for(var i=0; i<nodes.length;i++){
		if(nodes[i].taught > t)
			t = nodes[i].taught;
	}
	return t;
}
//utility function 
function add(a, b) {
    return a + b;
}
var x1bin=[0,0,0],x2bin=[0,0,0],x3bin=[0,0,0],x4bin=[0,0],x5bin=[0,0],x6bin=[0,0],x7bin=[0,0],x8bin=[0,0];
//no need to store arrays, just add them after dampening them, x1bin = [bin1_count, bin2_count,bin3_count]
function makeExample2(num){
	//dynamic features
	if(num==1)
		pos = pos+1;
	else{
		neg = neg+1;
		return;
	}
	if((rNode.features.inTime/time) > 0.5){
		x6bin[0] = x6bin[0]*damp + 1;x6bin[1] = x6bin[1]*damp;
	}
	else{
		x6bin[1] = x6bin[1]*damp + 1;x6bin[0] = x6bin[0]*damp;
	}
	rNode.features.parentTaught = mostRecent(rNode.parents);
	var ax=mostRecent(rNode.unlinkedParents);
	if(rNode.features.parentTaught < ax)
		rNode.features.parentTaught = ax;
	if(cNode.depth!=0)
		var parentTaughtRatio = rNode.features.parentTaught/time;
	else 
		var parentTaughtRatio = 0;
	if(rNode.depth==0)
		var parentTaughtRatio = 0;
	
	if(parentTaughtRatio > 0.7){
		x5bin[0] = x5bin[0]*damp + 1;x5bin[1] = x5bin[1]*damp;
	}
	else{
		x5bin[1] = x5bin[1]*damp + 1;x5bin[0] = x5bin[0]*damp;
	}
	//static features
	var avgSize = rNode.features.avgSize;
	if(avgSize < 3 ){
		x1bin[0] = x1bin[0]*damp + 1;x1bin[1] = x1bin[1]*damp;x1bin[2] = x1bin[2]*damp;
	}
	else if(avgSize>=3 && avgSize<5){
		x1bin[1] = x1bin[1]*damp + 1;x1bin[0] = x1bin[0]*damp;x1bin[2] = x1bin[2]*damp;
	}
	else{
		x1bin[2] = x1bin[2]*damp + 1;x1bin[1] = x1bin[1]*damp;x1bin[0] = x1bin[0]*damp;
	}
	var depthHeight = rNode.depth/(rNode.depth+rNode.height);
	if(depthHeight < 0.25){
		x2bin[0] = x2bin[0]*damp + 1;x2bin[1] = x2bin[1]*damp;x2bin[2] = x2bin[2]*damp;
	}
	else if (depthHeight >= 0.25 && depthHeight<0.75){
		x2bin[1] = x2bin[1]*damp + 1;x2bin[0] = x2bin[0]*damp;x2bin[2] = x2bin[2]*damp;
	}
	else{
		x2bin[2] = x2bin[2]*damp + 1;x2bin[1] = x2bin[1]*damp;x2bin[0] = x2bin[0]*damp;
	}
	var numParent = rNode.features.numP;
	if(numParent<2){
		x4bin[0] = x4bin[0]*damp + 1;x4bin[1] = x4bin[1]*damp;
	}
	else{
		x4bin[1] = x4bin[1]*damp + 1;x4bin[0] = x4bin[0]*damp;
	}
	
	var numChild = rNode.features.numC;
	if(numChild == 0){
		x3bin[0] = x3bin[0]*damp + 1;x3bin[1] = x3bin[1]*damp;x3bin[2] = x3bin[2]*damp;
	}
	else if(numChild == 1){
		x3bin[1] = x3bin[1]*damp + 1;x3bin[0] = x3bin[0]*damp;x3bin[2] = x3bin[2]*damp;
	}
	else{
		x3bin[2] = x3bin[2]*damp + 1;x3bin[1] = x3bin[1]*damp;x3bin[0] = x3bin[0]*damp;
	}
	var d=0,b=0,f=0,g=0;
	for(var i=0;i<rList.length;i++){
		if(rList[i].depth == (cNode.depth+1))
			d++;
		else if(rList[i].depth == cNode.depth)
			b++;
		else if(rList[i].depth > cNode.depth)
			f++;
		else 
			g++;
	}
	
	if(rNode.depth > cNode.depth+considerDepth){
		if(d/b > 1){
			x7bin[0] = x7bin[0]*damp + 1;x7bin[1] = x7bin[1]*damp;
		}
		else{
			x7bin[1] = x7bin[1]*damp + 1;x7bin[0] = x7bin[0]*damp;
		}
	}
	else{
		if(d/b > 1){
			x7bin[1] = x7bin[1]*damp + 1;x7bin[0] = x7bin[0]*damp;
		}
		else{
			x7bin[0] = x7bin[0]*damp + 1;x7bin[1] = x7bin[1]*damp;
		}
	}
	
	var ub2=0;
	if(dbfg.length>0)
		var str = dbfg[dbfg.length-1]; 
	if(rNode.depth == (cNode.depth+1)){
		ub1 = d/(d+b+f+g)||0;
		if(dbfg.length>0){
		var str1=str+"d";var str2=str+"b";var str3=str+"f";var str4=str+"g";
		var re1 = new RegExp(str1,"g");var re2 = new RegExp(str2,"g");var re3 = new RegExp(str3,"g");var re4 = new RegExp(str4,"g");
		ub2 = (dbfg.match(re1) || []).length/(0.0001+(dbfg.match(re1) || []).length+(dbfg.match(re2) || []).length+(dbfg.match(re3) || []).length+(dbfg.match(re4) || []).length);
		}
		//dbfg+="d";
	}
	else if(rNode.depth == cNode.depth){
		ub1 = b/(d+b+f+g)||0;
		if(dbfg.length>0){
		var str1=str+"b";var str2=str+"d";var str3=str+"f";var str4=str+"g";
		var re1 = new RegExp(str1,"g");var re2 = new RegExp(str2,"g");var re3 = new RegExp(str3,"g");var re4 = new RegExp(str4,"g");
		ub2 = (dbfg.match(re1) || []).length/(0.0001+(dbfg.match(re1) || []).length+(dbfg.match(re2) || []).length+(dbfg.match(re3) || []).length+(dbfg.match(re4) || []).length);
		}
		//dbfg+="b";
	}
	else if(rNode.depth > cNode.depth){
		ub1 =  f/(d+b+f+g)||0;
		if(dbfg.length>0){
		var str1=str+"f";var str2=str+"d";var str3=str+"b";var str4=str+"g";
		var re1 = new RegExp(str1,"g");var re2 = new RegExp(str2,"g");var re3 = new RegExp(str3,"g");var re4 = new RegExp(str4,"g");
		ub2 = (dbfg.match(re1) || []).length/(0.0001+(dbfg.match(re1) || []).length+(dbfg.match(re2) || []).length+(dbfg.match(re3) || []).length+(dbfg.match(re4) || []).length);
		}
		//dbfg+="f";
	}
	else{
		ub1 =  g/(d+b+f+g)||0;
		if(dbfg.length>0){
		var str1=str+"g";var str2=str+"d";var str3=str+"f";var str4=str+"b";
		var re1 = new RegExp(str1,"g");var re2 = new RegExp(str2,"g");var re3 = new RegExp(str3,"g");var re4 = new RegExp(str4,"g");
		ub2 = (dbfg.match(re1) || []).length/(0.0001+(dbfg.match(re1) || []).length+(dbfg.match(re2) || []).length+(dbfg.match(re3) || []).length+(dbfg.match(re4) || []).length);
		}
		//dbfg+="g";
	}
	if(ub2>0.5){
		x8bin[0] = x8bin[0]*damp + 1;x8bin[1] = x8bin[1]*damp;
	}
	else{
		x8bin[1] = x8bin[1]*damp + 1;x8bin[0] = x8bin[0]*damp;
	}
	examples2=[x1bin,x2bin,x3bin,x4bin,x5bin,x6bin,x7bin,x8bin];
	probs=[[],[],[],[],[],[],[],[]];
	for(var i=0;i<examples2.length;i++){
		var reducedSumOfBin=0;
		reducedSumOfBin = examples2[i].reduce(add,0)+examples2[i].length;
		for(var j=0;j<examples2[i].length;j++){
			probs[i].push((examples2[i][j]+1)/reducedSumOfBin);
		}
	}

}

function makePredInput2(listNode){
	var x=[0,0,0,0,0,0,0,0];
	//dynamic features
	if((listNode.features.inTime/time) > 0.5){
		x[5] = 0;
	}
	else{
		x[5] = 1;
	}
	listNode.features.parentTaught = mostRecent(listNode.parents);
	var ax=mostRecent(listNode.unlinkedParents);
	if(listNode.features.parentTaught < ax)
		listNode.features.parentTaught = ax;
	if(cNode.depth!=0)
		var parentTaughtRatio = listNode.features.parentTaught/time;
	else 
		var parentTaughtRatio = 0;
	if(listNode.depth==0)
		var parentTaughtRatio = 0;
	
	if(parentTaughtRatio > 0.7){
		x[4] = 0;
	}
	else{
		x[4] = 1;
	}
	//static features
	var avgSize = listNode.features.avgSize;
	if(avgSize < 3 ){
		x[0] = 0;
	}
	else if(avgSize>=3 && avgSize<5){
		x[0] = 1;
	}
	else
		x[0] = 2;
	
	var depthHeight = listNode.depth/(listNode.depth+listNode.height);
	if(depthHeight < 0.25)
		x2=0;
	else if (depthHeight >= 0.25 && depthHeight<0.75)
		x[1]=1;
	else
		x[1]=2;
	
	var numParent = listNode.features.numP;
	if(numParent<2)
		x[3]=0;
	else
		x[3]=1;
	
	var numChild = listNode.features.numC;
	if(numChild == 0)
		x[2]=0;
	else if(numChild == 1)
		x[2]=1;
	else
		x[2]=2;
	
	var d=0,b=0,f=0,g=0;
	for(var i=0;i<rList.length;i++){
		if(rList[i].depth == (cNode.depth+1))
			d++;
		else if(rList[i].depth == cNode.depth)
			b++;
		else if(rList[i].depth > cNode.depth)
			f++;
		else 
			g++;
	}
	
	if(listNode.depth > cNode.depth+considerDepth){
		if((d+1)/(b+1) > 1)
			x[6]=0;
		else
			x[6]=1;
	}
	else{
		if((d+1)/(b+1) > 1)
			x[6]=1;
		else
			x[6]=0;
	}
	
	var ub2=0;
	if(dbfg.length>0)
		var str = dbfg[dbfg.length-1]; 
	if(listNode.depth == (cNode.depth+1)){
		ub1 = d/(d+b+f+g)||0;
		if(dbfg.length>0){
		var str1=str+"d";var str2=str+"b";var str3=str+"f";var str4=str+"g";
		var re1 = new RegExp(str1,"g");var re2 = new RegExp(str2,"g");var re3 = new RegExp(str3,"g");var re4 = new RegExp(str4,"g");
		ub2 = (dbfg.match(re1) || []).length/(0.0001+(dbfg.match(re1) || []).length+(dbfg.match(re2) || []).length+(dbfg.match(re3) || []).length+(dbfg.match(re4) || []).length);
		}
		//dbfg+="d";
	}
	else if(listNode.depth == cNode.depth){
		ub1 = b/(d+b+f+g)||0;
		if(dbfg.length>0){
		var str1=str+"b";var str2=str+"d";var str3=str+"f";var str4=str+"g";
		var re1 = new RegExp(str1,"g");var re2 = new RegExp(str2,"g");var re3 = new RegExp(str3,"g");var re4 = new RegExp(str4,"g");
		ub2 = (dbfg.match(re1) || []).length/(0.0001+(dbfg.match(re1) || []).length+(dbfg.match(re2) || []).length+(dbfg.match(re3) || []).length+(dbfg.match(re4) || []).length);
		}
		//dbfg+="b";
	}
	else if(listNode.depth > cNode.depth){
		ub1 =  f/(d+b+f+g)||0;
		if(dbfg.length>0){
		var str1=str+"f";var str2=str+"d";var str3=str+"b";var str4=str+"g";
		var re1 = new RegExp(str1,"g");var re2 = new RegExp(str2,"g");var re3 = new RegExp(str3,"g");var re4 = new RegExp(str4,"g");
		ub2 = (dbfg.match(re1) || []).length/(0.0001+(dbfg.match(re1) || []).length+(dbfg.match(re2) || []).length+(dbfg.match(re3) || []).length+(dbfg.match(re4) || []).length);
		}
		//dbfg+="f";
	}
	else{
		ub1 =  g/(d+b+f+g)||0;
		if(dbfg.length>0){
		var str1=str+"g";var str2=str+"d";var str3=str+"f";var str4=str+"b";
		var re1 = new RegExp(str1,"g");var re2 = new RegExp(str2,"g");var re3 = new RegExp(str3,"g");var re4 = new RegExp(str4,"g");
		ub2 = (dbfg.match(re1) || []).length/(0.0001+(dbfg.match(re1) || []).length+(dbfg.match(re2) || []).length+(dbfg.match(re3) || []).length+(dbfg.match(re4) || []).length);
		}
		//dbfg+="g";
	}
	if(ub2>0.5)
		x[7]=0;
	else
		x[7]=1;
	var prob=1;
	for(var jj=0;jj<probs.length;jj++){
		prob=prob*probs[jj][x[jj]];
	}
	predInputs2.push(prob);
}

//Update dynamic features after result of recommendation is positive
function positiveUpdate2(){
	counter++;poss2++;
	if(counter==subG.length){
		document.getElementById("current").value = document.getElementById("current").value+'-->'+rNode.order.toString();
		error = "You aced it!";
		document.getElementById("error").innerHTML = error;
		$('#error_modal').modal('show');
		return;
	}
	rNode.taught = time;
	makeExample2(1); //works on rNode and cNode
	time = time + 1;
	if(rNode.depth == (cNode.depth+1))
		dbfg+="d";
	else if(rNode.depth == cNode.depth)
		dbfg+="b";
	else if(rNode.depth > cNode.depth)
		dbfg+="f";
	else 
		dbfg+="g";
	rList.splice(rList.indexOf(rNode),1);
	var arg={visited:[]};
	var a = dfsLimited(rNode,arg,considerDepth);
	for(var i=0;i<a.length;i++){
		a[i].features.inTime = time;
		a[i].features.parentTaught = mostRecent(a[i].parents);  //last time when its parent was taught
		var b=mostRecent(a[i].unlinkedParents);
		if(b>a[i].features.parentTaught)
			a[i].features.parentTaught = b;
		if(rList.indexOf(a[i])<0)
		rList.push(a[i]);
	}
	for(kk=0;kk<unvisited.length;kk++){
		if(rList.indexOf(unvisited[kk])<0)
		rList.push(unvisited[kk]);
	}
	unvisited=[];
	rListFilter(rList);
	cNode = rNode;
	document.getElementById("current").value = document.getElementById("current").value+'-->'+cNode.order.toString();
}

function negativeUpdate2(){
	makeExample2(0);negg2++;
	var ind=rList.indexOf(rNode);
	unvisited.push(rList[ind]);
	rList.splice(ind,1);
}

function initRec2(){
	rList = [];counter=1;
	var begin = document.getElementById("startNode").value;
	var node = search(linearGraph,begin);
	
	document.getElementById("current").value = node.order;
	if(node){
		node.taught = 1;
		node.features.inTime = 1;
		cNode = node;
	}
	else 
		return null;
	var sem = document.getElementById("sem_no").value;
	if(node.depth == 0 && sem==1)
		subG = linearGraph;
	else
		subG = subgraph(begin);
	if(subG){

	var arg = {visited:[]};
	var a = dfsLimited(node,arg,considerDepth);
	for(var i=0;i<a.length;i++){
		rList.push(a[i]);
	}
	dList = depthList(subG);
	if(dList[0][0].depth == 0){
		for(var mm=0;mm<dList[0].length;mm++){
			if(node!=dList[0][mm])
				rList.push(dList[0][mm]);
		}
		
	}
	rListFilter(rList);
	//sgdw = weightInit(numFeatures);
	for(var i=0;i<rList.length;i++){
		makePredInput2(rList[i]);
	}
	outputs2.push(nbPredict(predInputs2));
	rNode = outputs2[0][0];
	acc = outputs2[0][1];
	
	document.getElementById("recc").value = rNode.order;
	}
}

function nbPredict(inputs){
	var maxInd;var max=0;
	for(var i=0;i<inputs.length;i++){
		if(max<inputs[i]){
			max=inputs[i];
			maxInd=i;
		}
	}
	return [rList[maxInd],max];
}

function train2(choice){
	if(choice == 1){
		positiveUpdate2();
	}
	else{
		negativeUpdate2();
	}
	if(counter==subG.length)
		return;
	if(counter!=subG.length && rList.length==0){
		//alert("No more recommendations.");
			error = "You have not fulfilled pre-requisites for unread predicates.";
		document.getElementById("error1").innerHTML = error;
		$('#error_modal1').modal('show');
		return;
	}
	//gradUpdate(examples[0],outputs2[0][1],targets[0],sgdw,alpha);
	//examples2.splice(0,1);targets2.splice(0,1);
	outputs2.splice(0,1);
	predInputs2=[];
	
	for(var i=0;i<rList.length;i++){
		makePredInput2(rList[i]);
	}
	outputs2.push(nbPredict(predInputs2));
	document.getElementById("recc").value=outputs2[0][0].order;
	rNode = outputs2[0][0];
}

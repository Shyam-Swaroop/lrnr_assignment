var sgdw = [];var rNode;var acc;var cNode;var time=1;var subG;var alpha=0.2; var examples=[];var targets=[];var dbfg="";var predInputs=[];var numFeatures=9;
var outputs = [];var unvisited=[];var counter;var poss=0;var negg=0;var algo;
function weightInit(num){
	var res = [];
	for(var i=0;i<num;i++){
		res.push([Math.random()]);
	}
	return res;
}

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

//makeExample taking the recommended node at time 
function makeExample(num){
	//dynamic features
	var inTimeRatio =  rNode.features.inTime/cNode.features.inTime;
	rNode.features.parentTaught = mostRecent(rNode.parents);
	var ax=mostRecent(rNode.unlinkedParents);
	if(rNode.features.parentTaught < ax)
		rNode.features.parentTaught = ax;
	if(cNode.depth!=0)
		var parentTaughtRatio = rNode.features.parentTaught/cNode.features.parentTaught;
	else 
		var parentTaughtRatio = 0;
	if(rNode.depth==0)
		var parentTaughtRatio = 0;
	//static features
	var avgSizeRatio = rNode.features.avgSize/cNode.features.avgSize;
	var depthHeightRatio = ((rNode.depth+0.5)*(cNode.height + 0.5))/((cNode.depth + 0.5)*(rNode.height + 0.5));
	var numParent = rNode.features.numP;
	var numChildRatio = rNode.features.numC/(cNode.features.numC+1);
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
	var ub1=0;var ub2=0;
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
	examples.push([1,inTimeRatio,parentTaughtRatio,avgSizeRatio,depthHeightRatio,numParent,numChildRatio,ub1,ub2]);
	targets.push(num);
}
//predInputs -- converting rList nodes into final feature vector
function makePredInput(listNode){
	//dynamic features
	var inTimeRatio =  listNode.features.inTime/cNode.features.inTime;
	listNode.features.parentTaught = mostRecent(listNode.parents);
	var ax=mostRecent(listNode.unlinkedParents);
	if(listNode.features.parentTaught < ax)
		listNode.features.parentTaught = ax;
	if(cNode.depth!=0)
		var parentTaughtRatio = listNode.features.parentTaught/cNode.features.parentTaught;
	else 
		var parentTaughtRatio = 0;
	if(listNode.depth==0)
		var parentTaughtRatio = 0;
	//static features
	var avgSizeRatio = listNode.features.avgSize/cNode.features.avgSize;
	var depthHeightRatio = ((listNode.depth+0.5)*(cNode.height + 0.5))/((cNode.depth + 0.5)*(listNode.height + 0.5));
	var numParent = listNode.features.numP;
	var numChildRatio = listNode.features.numC/(cNode.features.numC+1);
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
	var ub1=0;var ub2=0;
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
	predInputs.push([1,inTimeRatio,parentTaughtRatio,avgSizeRatio,depthHeightRatio,numParent,numChildRatio,ub1,ub2]);

}

//Update dynamic features after result of recommendation is positive
function positiveUpdate(){
	counter++;poss++;
	if(counter==subG.length){
		document.getElementById("current").value = document.getElementById("current").value+'-->'+rNode.order.toString();
		//alert("You aced it!");
		error = "You aced it!";
		document.getElementById("error").innerHTML = error;
		$('#error_modal').modal('show');
		return;
	}
	rNode.taught = time;
	makeExample(1); //works on rNode and cNode
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

function negativeUpdate(){
	makeExample(0);negg++;
	var ind=rList.indexOf(rNode);
	unvisited.push(rList[ind]);
	rList.splice(ind,1);
}



function sigmoid(x,w){
	var x_ = [x];
	var m = matMul(x_,w);
	return 0.1/(0.1+Math.exp(-m));
}

function matMul(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows); 
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); 
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;          
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}

function gradUpdate(x,y,t,w,alpha){
	for(var i=0;i<w.length;i++){
		w[i][0] = w[i][0] + alpha*(t-y)*x[i];
	}
}
//begining node
function initRec(){
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
	sgdw = weightInit(numFeatures);
	for(var i=0;i<rList.length;i++){
		makePredInput(rList[i]);
	}
	outputs.push(sgdPredict(predInputs));
	rNode = outputs[0][0];
	acc = outputs[0][1];
	
	document.getElementById("recc").value = rNode.order;
	}
}


/////add nodes from begining node to considerdepth into rList
function dfsLimited(node,arg,depth){
	if(depth <= 0)
		return;
	var i;var children=[];
	for(var k=0;k<node.children.length;k++){
		children.push(node.children[k]);
	}
	
	for(var j=0;j<node.unlinkedChildren.length;j++){
		children.push(node.unlinkedChildren[j]);
	}
	//console.log([node,children]);
	if(children.length==0){
		return 1;
	}
		
	for(i = 0;i<children.length;i++){
		if(arg.visited.indexOf(children[i]) < 0){
			arg.visited.push(children[i]);
			dfsLimited(children[i],arg,depth-1);
		}
	}

	return arg.visited;
}

////filter for rList
function rListFilter(list){
	var allTaught = true;
	for(var i=0;i<list.length;i++){
		var p = [];
		for(var k=0;k<list[i].parents.length;k++){
			p.push(list[i].parents[k]);
		}
	
		for(var l=0;l<list[i].unlinkedParents.length;l++){
			p.push(list[i].unlinkedParents[l]);
		}
		for(var j=0;j<p.length;j++){
			if(p[j].taught<=0)
				allTaught = false;
		}
		if(!allTaught)
			list.splice(i,1);

	}
	for(var i=0;i<list.length;i++){
		if(list[i].taught > 0)
			list.splice(i,1);
	}
	
}

function sgdPredict(inputs){
	var res = [];var max=-Infinity;var maxIndex;var a;
	for(var i=0;i<inputs.length;i++){
		a = sigmoid(inputs[i],sgdw);
		if(a>max){
			max=a;
			maxIndex=i;
		}
	}
	return [rList[maxIndex],max];
}

function f_train(choice){
	if(choice == 1){
		positiveUpdate();
	}
	else{
		negativeUpdate();
	}
	if(counter==subG.length)
		return;
	if(counter!=subG.length && rList.length==0){
		//alert("No more recommendations.");
		var error = "You have not fulfilled pre-requisites for unread predicates.";
		document.getElementById("error1").innerHTML = error;
		$('#error_modal1').modal('show');
		return;
	}
	gradUpdate(examples[0],outputs[0][1],targets[0],sgdw,alpha);
	examples.splice(0,1);outputs.splice(0,1);targets.splice(0,1);
	predInputs=[];
	
	for(var i=0;i<rList.length;i++){
		makePredInput(rList[i]);
	}
	outputs.push(sgdPredict(predInputs));
	document.getElementById("recc").value=outputs[0][0].order;
	rNode = outputs[0][0];
}

function init(){
	rList = [];sgdw = [];rNode={};acc="";cNode={};time=1;subG={};alpha=0.2; examples=[];targets=[];dbfg="";predInputs=[];numFeatures=9;
outputs = [];unvisited=[];counter=0;poss=0;negg=0;
predInputs2=[]; targets2=[]; examples2=[]; outputs2=[];unvisited=[]; counter;
damp=0.8;probs=[[0.5,0.3,0.2],[0.5,0.3,0.2],[0.5,0.3,0.2],[0.5,0.5],[0.5,0.5],[0.5,0.5],[0.5,0.5],[0.5,0.5]];pos=0; neg=0; poss2=0; negg2=0;
	document.getElementById("recc").value = "";
	document.getElementById("current").value="";
	algo = $('input[name=algo]:checked').val();
	if(algo==1){
		initRec();
	}
	else if(algo==2){
		initRec2();
	}
	else if(algo==3){
		initRec3();
	}
	else if(algo==4){
		initRec4();
	}
}

function training(choice){
	if(algo==1){
		f_train(choice);
		document.getElementById("a1").innerHTML = (poss*100/(negg+poss)).toFixed(1);
	}
	else if(algo==2){
		train2(choice);
		document.getElementById("a2").innerHTML = (poss2*100/(negg2+poss2)).toFixed(1);
	}
	else if(algo==3){
		cycle(choice);
		document.getElementById("a3").innerHTML = (posss*100/(neggg+posss)).toFixed(1);
	}
	else if(algo==4){
		train4(choice);
		document.getElementById("a4").innerHTML = (pos4*100/(neg4+pos4)).toFixed(1);
	}
}

function endFunc(choice){
	error = "Thanks for trying Zapdos recommender system!! Hope you had great exerience.";
	document.getElementById("error2").innerHTML = error;
	$('#error_modal2').modal('show');
	if(choice==1)
		document.getElementById("current").value = document.getElementById("current").value + "-->" + rNode.order;

}
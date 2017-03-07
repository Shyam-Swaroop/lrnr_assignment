var dataSet = []; var numFeatures=9;var num=5; var count=0;//length of data will be numFeatures+1, last one for output
var posss=0;var neggg=0;var oobeLimit=0.5;
var alph = 0.1*(posss+neggg) ;var beta=0.1;var numTrees=10; 
function Node(){
	this.left = null;
	this.right = null;
	this.randomWeights = createRandomTests(5,9); // array containing num arrays of weights
	this.randomThresholds = createThresholds(5); //to hold num threshold values corresponding
	this.data = []; //to hold the index of data points
	this.test = null;
	this.parent = null;
}

Node.prototype.createChildren = function(x,y){
	var indx;var deltaL = Infinity;
	for(var i=0;i<this.randomWeights.length;i++){
		var lt=[];var rt=[];var rp;var lp;
		for(var j=0;j<this.data.length;j++){
			if(vectorSigmoid(dataSet[this.data[j]],this.randomWeights[i]) > this.randomThresholds[i])
				rt.push(dataSet[this.data[j]][numFeatures]);
			else 
				lt.push(dataSet[this.data[j]][numFeatures]);
		}
		if(rt.length != 0)
			rp = rt.reduce(add,0)/rt.length;
		else 
			rp = 0;
		if(lt.length !=0)
			lp = lt.reduce(add,0)/lt.length;
		else
			lp = 0;
		var a = rt.length*entropy(rp) + lt.length*entropy(lp);
		if(deltaL > a){
			deltaL = a;
			indx = i;
		}
	}
	this.test = [this.randomWeights[indx],this.randomThresholds[indx]];
	var rnode = new Node();
	var lnode = new Node();
	for(var i=0;i<this.data.length;i++){
		if(vectorSigmoid(dataSet[this.data[i]],this.randomWeights[indx]) > this.randomThresholds[indx])
			rnode.data.push(this.data[i]);
		else 
			lnode.data.push(this.data[i]);		
	}
	lnode.parent =this;
	rnode.parent = this;
	this.left = lnode;
	this.right = rnode;
	//this.data = null;
	this.randomWeights = null;
	this.randomThresholds = null;
	
}

function getPoisson(lambda) {
  var L = Math.exp(-lambda);
  var p = 1.0;
  var k = 0;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return k - 1;
}

function vectorSigmoid(data,weights){
	var res=0;
	for(var i=0;i<weights.length-1;i++){
		res+=data[i]*weights[i];
	}
	return 0.1/(0.1+Math.exp(-res));
}

function entropy(p){
	if(p!=0 && p!=1 && p < 1)
		return -p*Math.log2(p) - (1-p)*Math.log2(1-p);
	else
		return 0;
}

function createRandomTests(num,numFeatures){
	var ress = [];
	for(var j=0;j<numFeatures;j++){
		var res = [];
		for(var i=0;i<num;i++){
			res.push(Math.random());
		}
		ress.push(res);
	}
	return ress;
}

function createThresholds(num){
	var res=[];
	for(var i=0;i<num;i++){
		res.push(Math.random());
	}
	return res;
}

function Tree(){
	this.__root = new Node();
	this.oobe=0;
	this.oobCount = 0;
}

Tree.prototype.findLeaf = function (data){
	return preOrder(this.__root,data);
}
//utility to find the leaf node
function preOrder(node,data){
	if(node.test==null){
		//updateNode(j,<x,y>)
		node.data.push(dataSet.length-1);
		return node;
	}
	if(vectorSigmoid(data,node.test[0]) > node.test[1])
		return preOrder(node.right,data);
	else
		return preOrder(node.left,data);

}

Node.prototype.addChildTest = function(){
	var deltaL = -Infinity;
	if(this.data.length > alph){
		var nodeEntropy ;
		var b=0;
		for(var i=0;i<this.randomWeights.length;i++){
		var lt=[];var rt=[];
			for(var j=0;j<this.data.length;j++){
				if(vectorSigmoid(dataSet[this.data[j]],this.randomWeights[i]) > this.randomThresholds[i])
					rt.push(dataSet[this.data[j]][numFeatures]);
				else 
					lt.push(dataSet[this.data[j]][numFeatures]);
				b+=dataSet[this.data[j]][numFeatures];
			}
			nodeEntropy = entropy(b/this.data.length);
			if(rt.length != 0)
				rp = rt.reduce(add,0)/rt.length;
			else 
				rp = 0;
			if(lt.length !=0)
				lp = lt.reduce(add,0)/lt.length;
			else
				lp = 0;
			var a = nodeEntropy - rt.length*entropy(rp) - lt.length*entropy(lp);
			if(deltaL < a){
				deltaL = a;
				if(deltaL > beta)
					return 1;
				indx = i;
			}
		}
	}
}

var forest = [];
function createForest(){
	for(var i=0;i<numTrees;i++){
		forest.push(new Tree());
	}
}

function trainRf(){
	for(var i=0;i<forest.length;i++){
		var k = getPoisson(1);
		if(k>0){
			for(j=0;j<k;j++){
				var leaf = forest[i].findLeaf(dataSet[dataSet.length-1]);
				if(leaf.addChildTest()){
					leaf.createChildren();
				}
			}
		}
		else{
			forest[i].oobe = updateOobe(forest[i],dataSet[dataSet.length-1]);
			forest[i].oobCount+=1;
			console.log(forest[i].oobe);
			if(forest[i].oobe > oobeLimit){
				forest[i] = null;
				forest[i] = new Tree();
			}
		} 
			
	}
}
function updateOobe(tree,data){
	if (predTree(tree.__root,data) > 0.5 && data[data.length-1] == 0){
		tree.oobe = (tree.oobCount*tree.oobe+1)/(tree.oobCount+1);
	}
	if (predTree(tree.__root,data) <= 0.5 && data[data.length-1] == 1){
		tree.oobe = (tree.oobCount*tree.oobe+1)/(tree.oobCount+1);
	}
}

function predTree(node,data){
	if(node.test==null){
		var b=0;
		if(node.data.length!=0){
		for(var i=0;i<node.data.length;i++){
			b+=dataSet[node.data[i]][numFeatures];
		}
		return b/node.data.length;
	}
	else{
		var ab = (Math.random() > 0.5);
		if(ab)
			return 1;
		else
			return 0;
	}
		
	}
	
	if(vectorSigmoid(data,node.test[0]) > node.test[1])
		return predTree(node.right,data);
	else
		return predTree(node.left,data);
}

function rfPredict(inputs){
	var maxIndx,max=-Infinity;
	for(var i=0;i<inputs.length;i++){
		var treeres=[];
		for(var j=0;j<numTrees;j++){
			treeres.push(predTree(forest[j].__root,inputs[i]));
		}
		var a = treeres.reduce(add,0)/numTrees;
		if(a>max){
			max=a;
			maxIndx = i;
		}
	}
	return [rList[maxIndx],max];
}

//makeExample taking the recommended node at time 
function updateDataset(choice){
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
	dataSet.push([1,inTimeRatio,parentTaughtRatio,avgSizeRatio,depthHeightRatio,numParent,numChildRatio,ub1,ub2,choice]);
	
}

function positiveUpdate3(){
	counter++;posss++;
	if(counter==subG.length){
		document.getElementById("current").value = document.getElementById("current").value+'-->'+rNode.order.toString();
		//alert("You aced it!");
		error = "You aced it!";
		document.getElementById("error").innerHTML = error;
		$('#error_modal').modal('show');
		return;
	}
	rNode.taught = time;
	updateDataset(1); //works on rNode and cNode
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

function negativeUpdate3(){
	updateDataset(0);neggg++;
	var ind=rList.indexOf(rNode);
	unvisited.push(rList[ind]);
	rList.splice(ind,1);
}

function initRec3(){
	rList = [];counter=1;createForest();
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
		makePredInput(rList[i]);
	}
	//var output=rfPredict(predInputs);
	rNode = rList[0];
	//acc = output[1];
	document.getElementById("recc").value = rNode.order;
	}
}

function cycle(choice){
	if(choice == 1){
		positiveUpdate3();
	}
	else{
		negativeUpdate3();
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
	trainRf();

	predInputs=[];
	
	for(var i=0;i<rList.length;i++){
		makePredInput(rList[i]);
	}
	var output = rfPredict(predInputs);
	document.getElementById("recc").value=output[0].order;
	rNode = output[0];
}
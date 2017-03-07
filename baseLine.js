var pos4=0;var neg4=0;
function basePredict(){
	if(rList.length!=0){
		return rList[Math.floor(Math.random()*rList.length)];
	}
	else
		return null;
}

function positiveUpdate4(){
	counter++;pos4++;
	if(counter==subG.length){
		document.getElementById("current").value = document.getElementById("current").value+'-->'+rNode.order.toString();
		error = "You aced it!";
		document.getElementById("error").innerHTML = error;
		$('#error_modal').modal('show');
		return;
	}
	rNode.taught = time;
	 //works on rNode and cNode
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

function negativeUpdate4(){
	neg4++;
	var ind=rList.indexOf(rNode);
	unvisited.push(rList[ind]);
	rList.splice(ind,1);
}

function initRec4(){
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
	
	rNode = basePredict();

	
	document.getElementById("recc").value = rNode.order;
	}
}

function train4(choice){
	if(choice == 1){
		positiveUpdate4();
	}
	else{
		negativeUpdate4();
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

	var output=basePredict();
	document.getElementById("recc").value=output.order;
	rNode = output;
}
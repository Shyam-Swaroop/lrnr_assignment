var leaves = [];
function vertex(){
	this.order = "";
	this.depth = 0;
	this.parents = [];
	this.children = [];
	this.unlinkedParents = [];
	this.unlinkedChildren = [];
	this.X = 0;
	this.Y = 0;
	this.height = 0;
	this.taught = -1;
	this.numLinkedSiblings = [];
	this.numUnlinkedSiblings = [];
	this.numBackVisited = 0;
	this.size=0;
}
var error;
//To save in json format, cyclic nature of each vertex must be removed
function cyclic2acyclic(vertx){
	var output = {};
	output.order = vertx.order;
	output.height = vertx.height;
	output.taught = vertx.taught;
	output.numLinkedSiblings = vertx.numSiblings;
	output.numUnlinkedSiblings = vertx.numUnlinkedSiblings;
	output.numVisited = vertx.numVisited;
	output.parents = [];
	output.children = [];
	output.unlinkedChildren = [];
	output.unlinkedParents = [];
	output.size = vertx.size;
	vertx.parents.forEach(function(element){output.parents.push(element.order);});
	vertx.children.forEach(function(element){output.children.push(element.order);});
	vertx.unlinkedParents.forEach(function(element){output.unlinkedParents.push(element.order);});
	vertx.unlinkedChildren.forEach(function(element){output.unlinkedChildren.push(element.order);});
	return output;
}
//Convert graph to Json
function graph2json(graph){
	var i = 0;
	var output=[];
	for(i=0;i<graph.length;i++){
		output.push(cyclic2acyclic(graph[i]));
	}
	return JSON.stringify(output);
}

//Convert json format file into Directed Acyclic Graph
function json2graph(jsonStr,graph){
	var a = JSON.parse(jsonStr);
	var cmdSequence = a[1];
	for(var i =0 ;i <cmdSequence.length ; i++){
		addVertex(cmdSequence[i][0],cmdSequence[i][1],cmdSequence[i][2],graph);
	}
	doOnSave(graph);
}

function addVertex(cOrder,pOrder,puOrder,graph){
	commandSequence.push([cOrder,pOrder,puOrder]);   //delete this line during main implementation
	var child = search(graph,cOrder);
	var parent = null;
	var linked = false;
	//find parent and type of link
	if((pOrder.search(/\S/ig) >= 0)){
		parent = search(graph,pOrder);
		if(parent != null)
			linked = true;
	}
	else if((puOrder.search(/\S/ig) >= 0))
		parent = search(graph,puOrder);
	
	//if parent is null && (pOrder or puOrder) is not whitespace, return null, else make a vertex at depth 0
	if(parent == null && ((pOrder.search(/\S/ig) >= 0) || (puOrder.search(/\S/ig) >= 0))){
		//alert("Pre-requisite concept not found.");
		error = "Pre-requisite concept not found.";
		document.getElementById("error").innerHTML = error;
		$('#error_modal').modal('show');
		return null;
		}
	else if(parent == null && !((pOrder.search(/\S/ig) >= 0) || (puOrder.search(/\S/ig) >= 0)) && child==null){
		child = new vertex();
		child.order = cOrder;
		leaves.push(child);
		graph.push(child);
		return child;
	}
	
	//if child and parent both are present	
	if(child != null && parent!=null && parent.children.indexOf(child) < 0 && parent.unlinkedChildren.indexOf(child) < 0){
			if(child.depth < parent.depth + 1){
				var delta = parent.depth + 1 - child.depth;
				bfs_(child,changeDepth,{initDepth:child.depth,delta:delta});
			}
			if(linked){
				child.parents.push(parent);
				child.numLinkedSiblings.push(0);
				parent.children.push(child);
			}
			else{
				child.unlinkedParents.push(parent);
				child.numUnlinkedSiblings.push(0);
				parent.unlinkedChildren.push(child);
			}
			var leaveOut = leaves.indexOf(parent);
			if( leaveOut>=0){
				leaves.splice(leaveOut,1);
			}
			return child;
	}
	
	//if only parent is found
	if(child == null && parent!=null){
			child = new vertex();
			child.order = cOrder;
			child.depth = parent.depth +1;
			if(linked){
				child.parents.push(parent);
				child.numLinkedSiblings.push(0);
				parent.children.push(child);
			}
			else{
				child.unlinkedParents.push(parent);
				child.numUnlinkedSiblings.push(0);
				parent.unlinkedChildren.push(child);
			}
			var leaveOut = leaves.indexOf(parent);
			if( leaveOut>=0){
				leaves.splice(leaveOut,1);
			}
			leaves.push(child);
			graph.push(child);
			return child;
	}
}

//return the found vertex or null, linear search O(n), better then spending time O(nlogn) in sorting
function search(graph, order){
	var i=0;
	for(i=0; i < graph.length;i++){
		if(graph[i].order == parseInt(order))
			return graph[i];
	}
	return null;
}

//levelTraversal for search
function bfs(node,func,args){
	var fifo = [node];
	var curNode;
	var i;
	var visited = [];
	while(fifo.length!=0 ){
		curNode = fifo.pop();
		if(visited.indexOf(curNode) < 0){
			fifo = fifo.concat(curNode.children);
			fifo = fifo.concat(curNode.unlinkedChildren);
			target = func(curNode,args);
			if(target)
				return target;
			visited.push(curNode);
		}
	}
	return null;
}

//levelTraversal for carrying out function at all nodes
function bfs_(node,func,args){
	var fifo = [node];
	var curNode;
	var i;
	var visited = [];
	while(fifo.length!=0 ){
		curNode = fifo.pop();
		if(visited.indexOf(curNode) < 0){
			fifo = fifo.concat(curNode.children);
			fifo = fifo.concat(curNode.unlinkedChildren);
			func(curNode,args);
			visited.push(curNode);
		}
	}
	return null;
}



//dfs traversal for search, don't forget to make this visited empty after traversal
//var visited = [];
function dfs(node,func,args,arg){
	var target=null;
	var i;
	var children = node.children;
	children.concat(node.unlinkedChildren);
	if(children.length==0)
		return null;
	if(children.length!=0)
	for(i = 0;i<children.length;i++){
		target = dfs(children[i],func,args);
		if (target)
			return target;
		target = func(node,args);
		if(target)
			return target;
	}
	return target;
}
//don't forget to make this visited empty after traversing
function dfs_(node,func,args,arg){
	var i;
	var children = node.children;
	children.concat(node.unlinkedChildren);
	if(children.length==0)
		return null;
	if(children.length!=0)
	for(i = 0;i<children.length;i++){
		if(arg.visited.indexOf(children[i]) < 0){
			arg.visited.push(children[i]);
			dfs_(children[i],func,args);
		}
	}
	func(node,args);	
}
//arg={visited:[]},pass begining node of the graph
function dfsSize_(node,arg){
	
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
			dfsSize_(children[i],arg);
		}
	}

	return arg.visited.length + 1;
}
function dfsSize(graph){
	var arg={visited:[]};
	for(var i=0;i<graph.length;i++ ){
		arg={visited:[]};
		graph[i].size = dfsSize_(graph[i],arg);
	}
}
//pass begin node for subgraph
function dfsHeight_(node,arg){
	var i;
	var children = [];
	for(var k=0;k<node.children.length;k++){
		children.push(node.children[k]);
	}
	for(var j=0;j<node.unlinkedChildren.length;j++){
		children.push(node.unlinkedChildren[j]);
	}
	//console.log([node,node.height]);
	if(children.length==0){
		return 1;
	}

	for(i = 0;i<children.length;i++){
		if(arg.visited.indexOf(children[i]) < 0){
			arg.visited.push(children[i]);
			dfsHeight_(children[i],arg);
			if(arg.max<children[i].depth){
				arg.max=children[i].depth;
			}
		}
	}
	

	return arg.max - node.depth + 1;
}

function dfsHeight(graph){
	var arg;
	for(var i=0;i<graph.length;i++){
		arg={visited:[],max:-1};
		graph[i].height = dfsHeight_(graph[i],arg)
	}
}

//increase depth of all chained  event, positive delta to increase depth and negative delta to decrease depth
function changeDepth(node,args){
	if(args.initDepth + args.delta > node.depth)
		node.depth += args.delta;
}

//fold DAG graph into hash table format
function depthList(graph){
	if(graph == null){
		return null;
	}
	var list = [];
	var i = 0;
	for(i=0;i<linearGraph.length;i++){
		list[i] = [];
	}
	for(i = 0; i < graph.length ; i++){
		list[graph[i].depth].push(graph[i]);
	}
	for(i=0;i<list.length;i++){
		if(list[i].length == 0){
			list.splice(i,1);
			i--;
		}
	}
	return list;
}

//create subgraph
function subgraph(beginOrder){
	node = search(linearGraph,beginOrder);
	if(node == null)
		return null;
	var subG=[];
	bfs_(node,demo,subG);
	return subG;
}

//demo to assist subgraph procedure
function demo(node, subG){
	subG.push(node);
}

//addVertex("1","","",linearGraph);
//addVertex("2","1","",linearGraph);
//addVertex("3","2","",linearGraph);
//ddVertex("4","3","",linearGraph);
//addVertex("5","4","",linearGraph);
//addVertex("6","5","",linearGraph);
//addVertex("7","6","",linearGraph);
//addVertex("8","7","",linearGraph);
//addVertex("9","","",linearGraph);
//addVertex("10","9","",linearGraph);
//addVertex("11","10","",linearGraph);
//addVertex("12","11","",linearGraph);
//addVertex("13","12","",linearGraph);
//addVertex("14","","13",linearGraph);
//addVertex("15","13","",linearGraph);
//sub=subgraph(9);
//dList = depthList(sub);

// h,w is canvas height and width
function drawVertices(dList,h,w){
	var i,j,x,y;
	for(i=0;i<dList.length;i++){
		y = (h*(i+1)/dList.length) -  h/(2*dList.length);
		for(j=0;j<dList[i].length;j++){
			x = (w*(j+1)/dList[i].length) - (w/(2*dList[i].length)); 
			drawRect(x,y);
		}
	}
}
//x, y is the location of center and dx, dy is the size of rectangle
function drawRect(x,y){
	var canvas = document.getElementById("graph");
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	var ww=ctx.measureText(document.getElementById("newNode").value).width;
	var dx = ww+20;
	var dy = 20;
	var cornerRadius = 5;
	ctx.lineJoin = "round";
	ctx.fillStyle = "orange";
	ctx.strokeStyle = "orange";
	ctx.stroke();
	ctx.lineWidth = cornerRadius;
	ctx.rect(x-dx/2,y-dy/2,dx,dy);
	ctx.fillStyle = "orange";
	ctx.fill();
	ctx.closePath();
}


function drawLabel(dList,h,w){
	var i,j,x,y;
	for(i=0;i<dList.length;i++){
		y = (h*(i+1)/dList.length) -  h/(2*dList.length);
		for(j=0;j<dList[i].length;j++){
			x = (w*(j+1)/dList[i].length) - (w/(2*dList[i].length)); 
			drawText(x,y,dList[i][j].order);
		}
	}
}


function drawText(x,y,label){
	var canvas = document.getElementById("graph");
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.font = "15px Ariel";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline="middle";
	ctx.shadowBlur = 10;
	ctx.shadowColor = "gray";
	ctx.fillText(label, x, y);
	ctx.closePath();
}

function drawEdges(dList,h,w){
	var i,j;
	for(i = 0;i<dList.length;i++){
		y1 = (h*(i+1)/dList.length) -  h/(2*dList.length);
		for(j=0;j<dList[i].length;j++){
			x1 = (w*(j+1)/dList[i].length) - (w/(2*dList[i].length)); 
			var l = dList[i][j].children;
			var c2 = [];
			for(var k=0;k<l.length;k++){
				c2=findCenter(l[k],dList,h,w);
				drawLine(x1,y1,c2[0],c2[1]);
			}
		}
	}
}

function drawLine(x1,y1,x2,y2){
	var canvas = document.getElementById("graph");
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.save();
	ctx.strokeStyle="blue";
	ctx.lineWidth=4;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.shadowBlur = 8;
	ctx.shadowColor = "gray";
	ctx.stroke();
	ctx.restore();
}

function findCenter(node,dList,h,w){
	var i,j;
	for(i=0;i<dList.length;i++){
		for(j=0;j<dList[i].length;j++){
			if(dList[i][j] == node){
				y = (h*(i+1)/dList.length) -  h/(2*dList.length);
				x = (w*(j+1)/dList[i].length) - (w/(2*dList[i].length));
				dList[i][j].X = x;
				dList[i][j].Y = y;
				return [x,y];
			}
				
		}
	}
}


function drawMain(dList,h,w){
	var canvas = document.getElementById("graph");
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.clearRect(0,0,500,500);
	
	drawEdges(dList,h,w);
	drawVertices(dList,h,w);
	drawLabel(dList,h,w);
	ctx.closePath();
}

function f_addButton(){
	var cOrder = document.getElementById("newNode").value;
	var pOrder = document.getElementById("oldLinked").value;
	var puOrder = document.getElementById("oldUnlinked").value;
	var output = addVertex(cOrder,pOrder,puOrder,linearGraph);
	if(output){
		commandSequence.push([cOrder,pOrder,puOrder]);
		//alert("Predicate has been added.");    
		var dList = depthList(linearGraph);
		drawMain(dList,500,500);
	}


}

function createButton(){
	linearGraph = [];
	commandSequence = [];
	//filename = prompt("Please enter the name of the course.");
	filename = document.getElementById("prompt_val").value;
	filename = filename.toLowerCase();
		if(filename){
		document.getElementById("newNode").removeAttribute("readonly");
		document.getElementById("oldLinked").removeAttribute("readonly");
		document.getElementById("oldUnlinked").removeAttribute("readonly");
	}
	document.getElementById("prompt_name").value = filename;
	$('#prompt_modal').modal('hide');
	leaves=[];
}

function saveButton(){
	if(!(filename.search(/\S/ig) >= 0))
		filename = "demo";
	doOnSave(linearGraph);
	var jsonStr = graph2json(linearGraph);
	var str = "[" + jsonStr + "," + JSON.stringify(commandSequence) + "]";
	var blob = new Blob([str], {type: "application/json"});
	var url  = URL.createObjectURL(blob);
	var a = document.createElement('a');
	a.download = filename + ".json";
	a.href = url;
	a.textContent = "Save "+filename+" ?";
	a.click();
}

function drawSubgraph(){
	var begin = document.getElementById("subgraphRoot").value;
	var subG = subgraph(begin);
	if(!subG){
		alert("Predicate not found.");
		return;
	}
	var dList = depthList(subG);
	drawMain(dList,500,500);
}

function saveSubgraph(){
	var filename = prompt("Enter subgraph filename.");
		if(!(filename.search(/\S/ig) >= 0))
		filename = "demo";
	var begin = document.getElementById("subgraphRoot").value;
	var subG = subgraph(begin);
	var jsonStr = graph2json(subG);
	var str = "[" + jsonStr + "," + JSON.stringify(commandSequence) + "]";
	var blob = new Blob([str], {type: "application/json"});
	var url  = URL.createObjectURL(blob);
	var a = document.createElement('a');
	a.download = filename + ".json";
	a.href = url;
	a.textContent = "Save "+filename+" ?";
	a.click();
}

function backCalculations(graph){
	var graphLeaves = [];
	for(var i=0;leaves.length;i++){
		if(graph.indexOf(leaves[i])>=0){
			graphLeaves.push(leaves[i]);
		}
	}
	for(var j=0;j<graphLeaves.length;j++){
		backBfsWithMultipleVisitsAllowed(graphLeaves[j],getHeight,{});
	}
}
// Utility for backCalculations
function backBfsWithMultipleVisitsAllowed(node,func,args){
	var fifo = [node];
	var curNode;
	var i;
	//var visited = [];
	while(fifo.length!=0 ){
		curNode = fifo.pop();
		fifo = curNode.parents.concat(fifo);
		fifo = curNode.unlinkedParents.concat(fifo);
		func(curNode,args);
	}
	return null;
}

//utility for backCalculations
function getHeight(node){
	node.height +=1;
	node.numBackVisited += 1;
}

//Calculate number of siblings
function numSibsForAllVertices(graph,func,args){
	var dList = depthList(graph);
	for (var i=0;i<dList[0].length;i++){
		bfs_(dList[0][i],func,args);
	}
}

//Utility foe numSibsForAllVertices
function countSiblings(node){
	for(var i=0;i<node.parents.length;i++){
		node.numLinkedSiblings.splice(i,1,node.parents[i].children.length);
	}
	for(var j=0;j<node.unlinkedParents.length;j++){
		node.numUnlinkedSiblings.splice(j,1,node.unlinkedParents[i].unlinkedChildren.length);
	}
	return [node.numLinkedSiblings,node.numUnlinkedSiblings];
}

//utility for both save and read of json file
function doOnSave(graph){
	numSibsForAllVertices(graph,countSiblings,{});
	dfsSize(graph);
	dfsHeight(graph);
}
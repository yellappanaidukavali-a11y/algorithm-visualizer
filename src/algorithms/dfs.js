export function dfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const nextNodesStack = [startNode];
  startNode.isVisited = true;

  while (nextNodesStack.length) {
    const currentNode = nextNodesStack.pop(); // pop for Stack behavior (DFS)
    
    // If we encounter a wall, we skip it.
    if (currentNode.isWall) continue;
    
    // If we haven't visited this node, mark it visited
    if (!currentNode.isVisited) {
       currentNode.isVisited = true;
    }
    
    visitedNodesInOrder.push(currentNode);
    
    // If we reached the target node, return
    if (currentNode === finishNode) return visitedNodesInOrder;
    
    const unvisitedNeighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      nextNodesStack.push(neighbor);
    }
  }
  return visitedNodesInOrder;
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const {col, row} = node;
  // Order matters in DFS for visual effect, typically we push in reverse order of desired traversal
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (row > 0) neighbors.push(grid[row - 1][col]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

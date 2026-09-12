// Returns all nodes in the order in which they were visited.
// Also makes nodes point back to their previous node, effectively allowing
// us to compute the shortest path by backtracking from the finish node.
export function bfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const nextNodesStack = [startNode];
  startNode.isVisited = true;

  while (nextNodesStack.length) {
    const currentNode = nextNodesStack.shift(); // shift for Queue behavior (BFS)
    
    // If we encounter a wall, we skip it.
    if (currentNode.isWall) continue;
    
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
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

// Backtracks from the finishNode to find the shortest path.
// Only works when called *after* the bfs method above.
export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode); // unshift adds to the beginning
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

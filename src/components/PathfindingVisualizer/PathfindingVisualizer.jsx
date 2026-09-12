import React, { useState, useEffect } from 'react';
import Node from './Node/Node';
import { bfs, getNodesInShortestPathOrder } from '../../algorithms/bfs';
import { dfs } from '../../algorithms/dfs';
import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 10;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;
const NUM_ROWS = 20;
const NUM_COLS = 50;

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('BFS');
  const [isVisualizing, setIsVisualizing] = useState(false);

  useEffect(() => {
    const initialGrid = getInitialGrid();
    setGrid(initialGrid);
  }, []);

  const handleMouseDown = (row, col) => {
    if (isVisualizing) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isVisualizing) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const animateAlgorithm = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited';
        }
      }, 10 * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-path';
        }
        if (i === nodesInShortestPathOrder.length - 1) {
            setIsVisualizing(false);
        }
      }, 50 * i);
    }
    if (nodesInShortestPathOrder.length === 0) {
       setIsVisualizing(false);
    }
  };

  const visualizeAlgorithm = () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    
    // Create a deep copy of the grid for the algorithm so we don't mutate state directly incorrectly
    const gridCopy = getInitialGrid();
    // Re-apply walls from current state
    for(let row = 0; row < NUM_ROWS; row++) {
        for(let col = 0; col < NUM_COLS; col++) {
            gridCopy[row][col].isWall = grid[row][col].isWall;
        }
    }
    
    const startNode = gridCopy[START_NODE_ROW][START_NODE_COL];
    const finishNode = gridCopy[FINISH_NODE_ROW][FINISH_NODE_COL];
    
    // Reset previous animations
    for(let row = 0; row < NUM_ROWS; row++) {
        for(let col = 0; col < NUM_COLS; col++) {
            const node = grid[row][col];
            if (!node.isStart && !node.isFinish && !node.isWall) {
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node';
            }
        }
    }

    let visitedNodesInOrder;
    if (selectedAlgorithm === 'BFS') {
      visitedNodesInOrder = bfs(gridCopy, startNode, finishNode);
    } else if (selectedAlgorithm === 'DFS') {
      visitedNodesInOrder = dfs(gridCopy, startNode, finishNode);
    }

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const clearBoard = () => {
    if (isVisualizing) return;
    const initialGrid = getInitialGrid();
    setGrid(initialGrid);
    for(let row = 0; row < NUM_ROWS; row++) {
        for(let col = 0; col < NUM_COLS; col++) {
            const node = initialGrid[row][col];
            if (!node.isStart && !node.isFinish) {
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node';
            }
        }
    }
  };

  return (
    <div className="pathfinding-visualizer">
      <h1>Algorithm Visualizer</h1>
      <div className="controls">
        <select 
            value={selectedAlgorithm} 
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isVisualizing}
        >
          <option value="BFS">Breadth-First Search (BFS)</option>
          <option value="DFS">Depth-First Search (DFS)</option>
        </select>
        <button onClick={() => visualizeAlgorithm()} disabled={isVisualizing}>
          Visualize {selectedAlgorithm}!
        </button>
        <button onClick={() => clearBoard()} disabled={isVisualizing}>
          Clear Board
        </button>
      </div>
      <div className="grid">
        {grid.map((row, rowIdx) => {
          return (
            <div key={rowIdx} className="grid-row">
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall } = node;
                return (
                  <Node
                    key={nodeIdx}
                    col={col}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(row, col) => handleMouseDown(row, col)}
                    onMouseEnter={(row, col) => handleMouseEnter(row, col)}
                    onMouseUp={() => handleMouseUp()}
                    row={row}
                  ></Node>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < NUM_COLS; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (node.isStart || node.isFinish) return newGrid; // Can't make start/finish a wall
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

export default PathfindingVisualizer;

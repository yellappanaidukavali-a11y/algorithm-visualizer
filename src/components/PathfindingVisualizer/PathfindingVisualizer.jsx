import React, { useState, useEffect } from 'react';
import Node from './Node/Node';
import { bfs, getNodesInShortestPathOrder } from '../../algorithms/bfs';
import { dfs } from '../../algorithms/dfs';
import './PathfindingVisualizer.css';

const DEFAULT_START_NODE_ROW = 10;
const DEFAULT_START_NODE_COL = 10;
const DEFAULT_FINISH_NODE_ROW = 10;
const DEFAULT_FINISH_NODE_COL = 35;
const NUM_ROWS = 20;
const NUM_COLS = 50;

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('BFS');
  const [isVisualizing, setIsVisualizing] = useState(false);
  
  const [startNodePos, setStartNodePos] = useState({ row: DEFAULT_START_NODE_ROW, col: DEFAULT_START_NODE_COL });
  const [finishNodePos, setFinishNodePos] = useState({ row: DEFAULT_FINISH_NODE_ROW, col: DEFAULT_FINISH_NODE_COL });
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingFinish, setIsDraggingFinish] = useState(false);

  useEffect(() => {
    const initialGrid = getInitialGrid(startNodePos, finishNodePos);
    setGrid(initialGrid);
  }, []);

  const handleMouseDown = (row, col) => {
    if (isVisualizing) return;
    
    if (row === startNodePos.row && col === startNodePos.col) {
      setIsDraggingStart(true);
    } else if (row === finishNodePos.row && col === finishNodePos.col) {
      setIsDraggingFinish(true);
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col, startNodePos, finishNodePos);
      setGrid(newGrid);
    }
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isVisualizing) return;

    if (isDraggingStart) {
      // Prevent dragging start node onto finish node
      if (row === finishNodePos.row && col === finishNodePos.col) return;
      
      const newPos = { row, col };
      setStartNodePos(newPos);
      
      // We need to visually update the grid right away
      const newGrid = grid.slice();
      // Remove old start node property
      for(let r=0; r<NUM_ROWS; r++) {
         for(let c=0; c<NUM_COLS; c++) {
             newGrid[r][c].isStart = false;
         }
      }
      // Set new start node property (and ensure it's not a wall)
      newGrid[row][col] = { ...newGrid[row][col], isStart: true, isWall: false };
      setGrid(newGrid);

    } else if (isDraggingFinish) {
      // Prevent dragging finish node onto start node
      if (row === startNodePos.row && col === startNodePos.col) return;
      
      const newPos = { row, col };
      setFinishNodePos(newPos);
      
      const newGrid = grid.slice();
      // Remove old finish node property
      for(let r=0; r<NUM_ROWS; r++) {
         for(let c=0; c<NUM_COLS; c++) {
             newGrid[r][c].isFinish = false;
         }
      }
      // Set new finish node property (and ensure it's not a wall)
      newGrid[row][col] = { ...newGrid[row][col], isFinish: true, isWall: false };
      setGrid(newGrid);

    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col, startNodePos, finishNodePos);
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingStart(false);
    setIsDraggingFinish(false);
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
    
    const gridCopy = getInitialGrid(startNodePos, finishNodePos);
    for(let row = 0; row < NUM_ROWS; row++) {
        for(let col = 0; col < NUM_COLS; col++) {
            gridCopy[row][col].isWall = grid[row][col].isWall;
        }
    }
    
    const startNode = gridCopy[startNodePos.row][startNodePos.col];
    const finishNode = gridCopy[finishNodePos.row][finishNodePos.col];
    
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
    const initialGrid = getInitialGrid(startNodePos, finishNodePos);
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
      <div className="grid" onMouseLeave={handleMouseUp}>
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

const getInitialGrid = (startPos, finishPos) => {
  const grid = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < NUM_COLS; col++) {
      currentRow.push(createNode(col, row, startPos, finishPos));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, startPos, finishPos) => {
  return {
    col,
    row,
    isStart: row === startPos.row && col === startPos.col,
    isFinish: row === finishPos.row && col === finishPos.col,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col, startPos, finishPos) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  // Can't make start/finish a wall
  if ((row === startPos.row && col === startPos.col) || (row === finishPos.row && col === finishPos.col)) {
    return newGrid;
  }
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

export default PathfindingVisualizer;

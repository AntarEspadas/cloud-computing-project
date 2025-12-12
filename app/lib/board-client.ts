"use client";

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  collaborators: string[];
}

class LocalBoardClient {
  private STORAGE_KEY = "boards_data";

  private getBoards(): Board[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveBoards(boards: Board[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(boards));
  }

  async list(userId?: string): Promise<{ data: Board[] }> {
    const boards = this.getBoards();
    // Filter by user if provided
    const filtered = userId 
      ? boards.filter(b => b.createdBy === userId || b.collaborators.includes(userId))
      : boards;
    return { data: filtered };
  }

  async create(board: Omit<Board, "id">): Promise<{ data: Board }> {
    const boards = this.getBoards();
    const newBoard: Board = {
      ...board,
      id: `board_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    boards.push(newBoard);
    this.saveBoards(boards);
    return { data: newBoard };
  }

  async update(updates: { id: string; name?: string; collaborators?: string[] }): Promise<{ data: Board | null }> {
    const boards = this.getBoards();
    const index = boards.findIndex(b => b.id === updates.id);
    
    if (index === -1) {
      return { data: null };
    }

    boards[index] = { ...boards[index], ...updates };
    this.saveBoards(boards);
    return { data: boards[index] };
  }

  async delete(params: { id: string }): Promise<{ data: Board | null }> {
    const boards = this.getBoards();
    const index = boards.findIndex(b => b.id === params.id);
    
    if (index === -1) {
      return { data: null };
    }

    const deleted = boards[index];
    boards.splice(index, 1);
    this.saveBoards(boards);
    return { data: deleted };
  }

  async get(id: string): Promise<{ data: Board | null }> {
    const boards = this.getBoards();
    const board = boards.find(b => b.id === id);
    return { data: board || null };
  }
}

export const boardClient = new LocalBoardClient();

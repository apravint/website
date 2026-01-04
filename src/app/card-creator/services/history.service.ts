import { Injectable, signal } from '@angular/core';

interface HistoryState {
    json: object;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private readonly undoStack = signal<HistoryState[]>([]);
    private readonly redoStack = signal<HistoryState[]>([]);
    private readonly maxHistory = 50;

    readonly canUndo = () => this.undoStack().length > 1;
    readonly canRedo = () => this.redoStack().length > 0;

    pushState(json: object): void {
        const state: HistoryState = {
            json: JSON.parse(JSON.stringify(json)),
            timestamp: Date.now()
        };

        const currentStack = [...this.undoStack()];
        currentStack.push(state);

        // Limit history size
        if (currentStack.length > this.maxHistory) {
            currentStack.shift();
        }

        this.undoStack.set(currentStack);
        this.redoStack.set([]); // Clear redo stack on new action
    }

    undo(): object | null {
        const currentStack = [...this.undoStack()];

        if (currentStack.length <= 1) return null;

        const currentState = currentStack.pop()!;
        const previousState = currentStack[currentStack.length - 1];

        // Move current state to redo stack
        this.redoStack.update(stack => [...stack, currentState]);
        this.undoStack.set(currentStack);

        return previousState.json;
    }

    redo(): object | null {
        const currentRedoStack = [...this.redoStack()];

        if (currentRedoStack.length === 0) return null;

        const stateToRestore = currentRedoStack.pop()!;

        this.redoStack.set(currentRedoStack);
        this.undoStack.update(stack => [...stack, stateToRestore]);

        return stateToRestore.json;
    }

    clear(): void {
        this.undoStack.set([]);
        this.redoStack.set([]);
    }

    getUndoCount(): number {
        return this.undoStack().length - 1;
    }

    getRedoCount(): number {
        return this.redoStack().length;
    }
}

import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, CollectionReference, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Kavithai {
    id?: string;
    description: string;
    email: string;
    title: string;
    user: string;
}

@Injectable({
    providedIn: 'root'
})
export class KavithaiService {
    private itemsCollection: CollectionReference<Kavithai>;

    constructor(private firestore: Firestore) {
        this.itemsCollection = collection(this.firestore, 'items') as CollectionReference<Kavithai>;
    }

    getKavithaigal(): Observable<Kavithai[]> {
        const q = query(this.itemsCollection);
        const data$ = collectionData(q, { idField: 'id' }) as Observable<Kavithai[]>;

        // Add logging for debugging
        return new Observable<Kavithai[]>(subscriber => {
            console.log('Attempting to fetch poems from Firestore...');
            const sub = data$.subscribe({
                next: (data) => {
                    console.log('Poems fetched successfully:', data);
                    subscriber.next(data);
                },
                error: (err) => {
                    console.error('Error fetching poems:', err);
                    subscriber.error(err);
                }
            });
            return () => sub.unsubscribe();
        });
    }
}

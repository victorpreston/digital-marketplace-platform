import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';

// Define the root state interface
export interface AppState {
  // Add feature states here as they are created
}

// Define the root reducers
export const reducers: ActionReducerMap<AppState> = {
  // Add feature reducers here
};

// Meta reducers
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];

// Selectors will be added here as features are developed
import React from 'react';
import ReactDOM from 'react-dom';
import {DrizzleProvider} from 'drizzle-react'

import {history, store} from './store'
import drizzleOptions from './drizzleOptions'
import DrizzleAppContainer from "./layouts/drizzle_app/DrizzleAppContainer";
import LoadingContainer from './components/LoadingContainer'

ReactDOM.render((
        <DrizzleProvider options={drizzleOptions} store={store}>
            <LoadingContainer>
                <DrizzleAppContainer/>
            </LoadingContainer>
        </DrizzleProvider>
    ),
    document.getElementById('root')
);

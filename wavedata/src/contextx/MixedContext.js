'use client';
import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';


const AppContext = createContext({
    api:null,
    signerAddress: null,
    contract: false,
    sendTransaction: async () => { },
    ReadContractByQuery: async () => { },
    getMessage: async () => { },
    getQuery: async () => { },
    getTX: async () => { },
    currentChain: null,

});


export function MixedProvider({ children }) {
   

    return <AppContext.Provider value={{ }}>{children}</AppContext.Provider>;

}
export const useMixedContext = () => useContext(AppContext);



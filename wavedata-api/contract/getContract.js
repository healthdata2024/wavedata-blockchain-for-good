import { Abi, ContractPromise } from '@polkadot/api-contract'
import abiData from './contracts/wavedata.json';


const address = 'Xq1gtLegXpcFibctXyJQDPSsG6XwcDRMcT132fvuaN7yfhd'//smart contract deployed address 
	
export default async function getContract(api) {


    const abi = new Abi(abiData, api.registry.getChainProperties())

    const contract = new ContractPromise(api, abi, address)

	return contract
  }
  
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Message,
  SYSTEM_INSTRUCTION_LAYOUTS,


} from '@solana/web3.js';
import bs58 from "bs58";

//   import fs from 'mz/fs.js';
//   import path from 'path';

import { deserializeUnchecked } from 'borsh';

import { createKeypairFromFile, getPayerFromFile } from './utils.mjs';

/**
 * Connection to the network
 */
let connection;


// Derive the address (public key) of a user account from the program so that it's easy to find later.
const SEED = "Hello";

/**
 * Our program id
 */
let programId;
let BackendKeyPair;


/**
 * The public key of the user account
 */
let userPubkey;
let BaseUserPubkey;


// Flexible class that takes properties and imbues them
// to the object instance
class Assignable {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      return (this[key] = properties[key]);
    });
  }
}

export class AccoundData extends Assignable { }

const dataSchema = new Map([
  [
    AccoundData,
    {
      kind: "struct",
      fields: [
        ["initialized", "u8"],
        ["tree_length", "u32"],
        ["map", { kind: 'map', key: 'string', value: 'string' }]
      ]
    }
  ]
]);
/**
* Establish a connection to the cluster
*/
export async function establishConnection() {
  let rpc = "https://nd-579-723-764.p2pify.com/5dc1aedbd31cca7d6cc1c8520d0822f4";
  let ws = "wss://ws-nd-579-723-764.p2pify.com/5dc1aedbd31cca7d6cc1c8520d0822f4";
  connection = new Connection(rpc, {wsEndpoint:ws});
}



/**
 * Check if the program has been deployed
 */
export async function checkProgram() {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile();
    BackendKeyPair = await getPayerFromFile();

    BaseUserPubkey = BackendKeyPair.publicKey;
    programId = programKeypair.publicKey;
  } catch (err) {
    console.error(err);

  }
  
  await CreateNewPDA();


}

export async function getTransferMessage() {


  const type = SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
  const data = Buffer.alloc(type.layout.span);
  const layoutFields = Object.assign({ instruction: type.index });
  type.layout.encode(layoutFields, data);

  const recentBlockhash = await connection.getLatestBlockhash();

  const messageParams = {
    accountKeys: [
      BackendKeyPair.publicKey.toString(),
      BackendKeyPair.publicKey.toString(),
      SystemProgram.programId.toString(),
    ],
    header: {
      numReadonlySignedAccounts: 0,
      numReadonlyUnsignedAccounts: 1,
      numRequiredSignatures: 1,
    },
    instructions: [
      {
        accounts: [0, 1],
        data: bs58.encode(data),
        programIdIndex: 2,
      },
    ],
    recentBlockhash: recentBlockhash.blockhash,
  };

  const message = new Message(messageParams);
  return message;
}



/**
 * Establish an account to pay for everything
 */
export async function establishPayer() {
  let fees = 0;


  // Calculate the cost to fund the greeter account
  fees += await connection.getMinimumBalanceForRentExemption(4000000);

  const message = (await getTransferMessage());

  let feeValues = await connection.getFeeForMessage(message);
  // Calculate the cost of sending transactions
  fees += feeValues.value * 100; // wag


  let lamports = await connection.getBalance(BackendKeyPair.publicKey);
  if (lamports < fees) {
    try {
      // If current balance is not enough to pay for fees, request an airdrop
      const sig = await connection.requestAirdrop(
        BackendKeyPair.publicKey,
        1,
      );
      console.log(sig);

      await connection.confirmTransaction(sig);
    } catch (error) {
    }

  }

}



export async function CreateNewPDA(checkMode = false) {


  userPubkey = await PublicKey.createWithSeed(
    BackendKeyPair.publicKey,
    SEED,
    programId,
  );
}


/**
 * Initializing Sate
 */
export async function InitializeState() {
  console.log('Initializing', programId.toBase58());

  let instruction_data = {
    "method": "Initialize"
  }
  let buffer_instruction = Buffer.from(JSON.stringify(instruction_data), "utf-8");


  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userPubkey, isSigner: false, isWritable: true },
    ],
    programId: programId,
    data: Uint8Array.from(buffer_instruction),
  });

  let signature = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(
      instruction),
    [BackendKeyPair],
  );


  const txdata = await connection.getParsedTransaction(signature);


}



export async function getAccountData(connection, account) {
  let nameAccount = await connection.getAccountInfo(
    account,
    'processed'
  );
  return deserializeUnchecked(dataSchema, AccoundData, nameAccount.data);
}



/**
 * Get Output
 */
export async function getOutput() {
  const account = await getAccountData(connection, userPubkey);
  return account;

}



/**
 * Update Data Inside Program
 */
export async function UpdateOrInsertData(key, value, extraArgs = {}) {

  let instruction_data = {
    "method": "UpdateOrInsert",
    "args": [key, value]
  }
  let buffer_instruction = Buffer.from(JSON.stringify(instruction_data), "utf-8");


  const instruction = new TransactionInstruction({
    programId: programId,
    keys: [
      { pubkey: userPubkey, isSigner: false, isWritable: true },
      { pubkey: BaseUserPubkey, isSigner: true, isWritable: false },
    ],
    data: Uint8Array.from(buffer_instruction), // All instructions are hellos
  });
  const transaction = new Transaction().add(instruction);


  if (extraArgs.send == true) {

    const params = {
      fromPubkey: BaseUserPubkey,
      toPubkey: userPubkey,
      lamports: extraArgs.lamports,
    };
    transaction.add(SystemProgram.transfer(params));

  }
  let { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = BaseUserPubkey;

  await sendAndConfirmTransaction(connection, transaction, [BackendKeyPair]);

}

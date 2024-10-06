
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}


    let useContract = await import("../../../../contract/useContract.ts");
    const {api,  signerAddress, sendTransaction, ReadContract,ParseBigNum} = await useContract.default();
  
    if (req.method !== 'POST') {
      res.status(405).json({ status: 405, error: "Method must have POST request" })
      return;
    }
  
    const { userid, image } = req.body;
    let details_element = await ReadContract(api, signerAddress, ("getUserDetails"), [Number(userid)]);
  
	
    await sendTransaction(api,signerAddress, "UpdateUser",[Number(userid), image, (ParseBigNum(details_element[1]) * 1e9).toFixed(0)]);

    await sendTransaction(api,signerAddress, "UpdateUser",[Number(userid), image, Number(details_element[1])]);
    res.status(200).json({ status: 200, value: "Updated!" })
  
  }
  
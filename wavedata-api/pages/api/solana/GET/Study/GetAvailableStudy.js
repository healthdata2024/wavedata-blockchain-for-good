
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}

  let useContract = await import("../../../../../contract/useContract.ts");
		const {api,  signerAddress, sendTransaction, ReadContract} = await useContract.default();
	let study_id = await ReadContract (api, signerAddress, "GetOngoingStudy", [Number(req.query.userid)]);
	let totalStudys = await  ReadContract(api, signerAddress, ("_StudyIds"));

  let all_available_studys = [];
  for (let i = 0; i < Number(totalStudys); i++) {
    let study_element = await ReadContract(api, signerAddress, ("_studyMap"), [Number(i)]);

    var newStudy = {
      id: Number(study_element.studyId),
      title: study_element.title,
      image: study_element.image,
      description: study_element.description,
      contributors: Number(study_element.contributors),
      audience: Number(study_element.audience),
      budget: Number(study_element.budget),      
      permissions: (study_element.permission),
    };
    if (study_id !== "False") {
      if (Number(study_id) !== newStudy.id)
        all_available_studys.push(newStudy);
    }else{
      all_available_studys.push(newStudy);
    }
  }
    res.status(200).json({ status: 200, value: JSON.stringify(all_available_studys) })
    return;
  
}

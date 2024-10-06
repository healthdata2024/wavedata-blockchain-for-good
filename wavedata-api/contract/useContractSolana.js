import {
	establishConnection,
	checkProgram,
	CreateNewPDA,
	getOutput,
	UpdateOrInsertData,
	
} from './client/wavedata.mjs';

export default async function useContractSolana() {
	let contractInstance = {
		api: null,
		contract: null,
		signerAddress: null,
		sendTransaction: sendTransaction,
		ReadContract: ReadContract,
	};

	// Establish connection to the cluster
	await establishConnection();

	// Check if the program has been deployed
	await checkProgram();


	async function sendTransaction(api, signerAddress, method, args = []) {
		await CreateNewPDA();
		switch (method) {
			case "CreateAccount":
				await CreateAccount.apply(this, args)
				break;
			case "UpdatePrivatekey":
				await UpdatePrivatekey.apply(this, args);
				break;
			case "UpdateAccessToken":
				await UpdateAccessToken.apply(this, args);
				break;
			case "CreateStudy":
				await CreateStudy.apply(this, args);
				break;
			case "CreateSurvey":
				await CreateSurvey.apply(this, args);
				break;
			case "CreateOrSaveSections":
				await CreateOrSaveSections.apply(this, args);
				break;
			case "CreateSurveyCategory":
				await CreateSurveyCategory.apply(this, args);
				break;
			case "UpdateStudy":
				await UpdateStudy.apply(this, args);
				break;
			case "UpdateSurvey":
				await UpdateSurvey.apply(this, args);
				break;
			case "UpdateReward":
				await UpdateReward.apply(this, args);
				break;
			case "UpdateAudience":
				await UpdateAudience.apply(this, args);
				break;
			case "UpdateUser":
				await UpdateUser.apply(this, args);
				break;
			case "UpdateFhir":
				await UpdateFhir.apply(this, args);
				break;
			case "CreateOngoingStudy":
				await CreateOngoingStudy.apply(this, args);
				break;
			case "CreateCompletedSurveys":
				await CreateCompletedSurveys.apply(this, args);
				break;
		}

	}

	async function getMapsFromContract(mapName) {
		let db = await getOutput();
		return db.map.get(mapName) !== undefined ? JSON.parse(db.map.get(mapName)) : [];
	}
	//Not using in front
	async function ReadVariablesFromContract(variable) {
		switch (variable) {
			case "_UserIds":
				return (await getMapsFromContract("_userMap")).length;
			case "_StudyIds":
				return (await getMapsFromContract("_studyMap")).length;
			case "_SurveyIds":
				return (await getMapsFromContract("_surveyMap")).length;
			case "_SurveyCategoryIds":
				return (await getMapsFromContract("_categoryMap")).length;
			case "_OngoingIds":
				return (await getMapsFromContract("_ongoingMap")).length;
			case "_AnsweredIds":
				return (await getMapsFromContract("_questionanswerdMap")).length;

		}
	}

	//Not using in front
	async function ReadMapsByIdFromContract(variable, args = null) {
		let db,oldMaps,fullJSON ;
		switch (variable) {
			case "_userMap":
				return (await getMapsFromContract("_userMap"))[args[0]];
			case "_studyMap":
				return (await getMapsFromContract("_studyMap"))[args[0]];
			case "_studyAudienceMap":
				return (await getMapsFromContract("_studyAudienceMap"))[args[0]];
			case "_surveyMap":
				return (await getMapsFromContract("_surveyMap"))[args[0]];
			case "_categoryMap":
				return (await getMapsFromContract("_categoryMap"))[args[0]];
			case "_sectionsMap":
				 db = await getOutput();
				 oldMaps = getAllContainsMapKeys(db.map, `_sectionsMap[${args[0]}]`);
				 fullJSON = "";
				for (let i = 0; i < oldMaps.length; i++) {
					const mapName = oldMaps[i];
					let value =  db.map.get(mapName)
					if (value !== "-1"|| value !== null){
						fullJSON +=value;
					}
				}
				return fullJSON;
			case "_fhirMap":
				 db = await getOutput();
				 oldMaps = getAllContainsMapKeys(db.map, `_fhirMap[${args[0]}]`);
				 fullJSON = "";
				for (let i = 0; i < oldMaps.length; i++) {
					const mapName = oldMaps[i];
					let value =  db.map.get(mapName)
					if (value !== "-1"|| value !== null){
						fullJSON +=value;
					}
				}
				return fullJSON;

			case "_ongoingMap":
				return (await getMapsFromContract("_ongoingMap"))[args[0]];
			case "_questionanswerdMap":
				return (await getMapsFromContract("_questionanswerdMap"))[args[0]];
			case "_completedsurveyMap":
				return (await getMapsFromContract("_completedsurveyMap"))[args[0]];

		}
	}

	//Using all here
	async function ReadContract(api, signerAddress, method, args = null) {

		if (args === null || args === []) {
			return await ReadVariablesFromContract(method);
		}

		switch (method) {
			case "CheckEmail":
				return await CheckEmail.apply(this, args)
				break;
			case "Login":
				return await Login.apply(this, args)
				break;
			case "getUserDetails":
				return await getUserDetails.apply(this, args)
				break;
			case "getAllSurveysIDByStudy":
				return await getAllSurveysIDByStudy.apply(this, args)
				break;
			case "GetOngoingStudy":
				return await GetOngoingStudy.apply(this, args)
				break;
			case "getAllCompletedSurveysIDByUser":
				return await getAllCompletedSurveysIDByUser.apply(this, args)
				break;
			default:
				return await ReadMapsByIdFromContract(method, args)
		}

	}

	return contractInstance;
}

//***************************************Get Functions***********************************//
export async function CheckEmail(email) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (email === element.email) return element.userId;
	}
	return "False";
}

export async function Login(email, password) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (email === element.email && password === element.password) return element.userId;
	}
	return "False";
}


export async function getUserDetails(userId) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];

	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userId === element.userId) return element;
	}
	return "False";
}


export async function getAllSurveysIDByStudy(studyId) {
	let db = await getOutput();
	let _surveyMap = db.map.get("_surveyMap") !== undefined ? JSON.parse(db.map.get("_surveyMap")) : [];
	let allSurveys = [];

	for (let i = 0; i < _surveyMap.length; i++) {
		const element = _surveyMap[i];
		if (studyId === element.studyId) allSurveys.push(element);
	}
	return allSurveys;
}


export async function GetOngoingStudy(userId) {
	let db = await getOutput();
	let _ongoingMap = db.map.get("_ongoingMap") !== undefined ? JSON.parse(db.map.get("_ongoingMap")) : [];

	for (let i = 0; i < _ongoingMap.length; i++) {
		const element = _ongoingMap[i];
		if (userId === element.userId) return element.studyId;
	}
	return "False";
}


export async function getAllCompletedSurveysIDByUser(userId) {
	let db = await getOutput();
	let _completedsurveyMap = db.map.get("_completedsurveyMap") !== undefined ? JSON.parse(db.map.get("_completedsurveyMap")) : [];
	let result = [];
	for (let i = 0; i < _completedsurveyMap.length; i++) {
		const element = _completedsurveyMap[i];
		if (userId === element.userId) {
			result.push(i);
		};
	}
	return result;
}


//*****************************Send Transaction Functions*********************************//
export async function CreateAccount(full_name, email, password,accessToken) {
	
	let db = await getOutput();
	var obj = {
		userId: 0,
		name: full_name,
		email: email,
		password: password,
		privatekey: "",
		walletaddress: "",
		image: "https://i.postimg.cc/SsxGw5cZ/person.jpg",
		credits: 0,
		accesstoken: accessToken,
		fhirid: 0

	}
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	obj['userId'] = _userMap.length;
	_userMap.push(obj);
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));
}

export async function UpdatePrivatekey(userid, privatekey) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userid === element.userId) {
			_userMap[i].privatekey = privatekey;
		}
	}
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));

}

export async function UpdateAccessToken(userid, accesstoken) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userid === element.userId) {
			_userMap[i].accesstoken = accesstoken;
		}
	}
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));

}

export async function CreateStudy(userId, image, title, description, permission, contributors, audience, budget) {
	let db = await getOutput();
	var obj = {
		studyId: 0,
		userId: userId,
		image: image,
		title: title,
		description: description,
		permission: permission,
		contributors: contributors,
		audience: audience,
		budget: budget,
		rewardType: "SOL",
		rewardPrice: 0,
		totalSpendingLimit: budget,
	}
	let _studyMap = db.map.get("_studyMap") !== undefined ? JSON.parse(db.map.get("_studyMap")) : [];
	obj['studyId'] = _studyMap.length;
	_studyMap.push(obj);
	await UpdateOrInsertData('_studyMap', JSON.stringify(_studyMap));
}
export async function CreateSurvey(studyId, userId, name, description, date, image, reward) {
	let db = await getOutput();
	var obj = {
		surveyId: 0,
		studyId: studyId,
		userId: userId,
		name: name,
		description: description,
		date: date,
		image: image,
		reward: reward,
		submission: 0,
	};
	let _surveyMap = db.map.get("_surveyMap") !== undefined ? JSON.parse(db.map.get("_surveyMap")) : [];
	obj['surveyId'] = _surveyMap.length;
	_surveyMap.push(obj);
	await UpdateOrInsertData('_surveyMap', JSON.stringify(_surveyMap));
}
export async function getCurrentStringSize(key, value) {

	let instruction_data = {
		"method": "UpdateOrInsert",
		"args": [key, value]
	}
	let buffer_instruction = Buffer.from(JSON.stringify(instruction_data), "utf-8");
	return buffer_instruction.length;


}
export function getSlicedData(totalSize, metadata) {
	let limit = 800;
	let currentPos = 0;
	let newStrArr = [];
	if (totalSize > limit) {
		for (let i = 0; totalSize > limit; i++) {
			newStrArr.push(metadata.slice(currentPos, (currentPos + limit)));
			totalSize -= limit;
			currentPos += limit;
		}
	}

	newStrArr.push(metadata.slice(currentPos, (currentPos + limit)));
	return newStrArr
}
export function getAllContainsMapKeys(mapData, keyname) {
	let allFoundKeys = [];
	let allkeys = Array.from(mapData.keys());
	for (let i = 0; i < allkeys.length; i++) {
		if (allkeys[i].includes(keyname)) {
			allFoundKeys.push(allkeys[i]);
		}
	}
	return allFoundKeys;
}
export async function CreateOrSaveSections(surveyId, metadata) {
	let db = await getOutput();
	let totalSize = await getCurrentStringSize("_sectionsMap", metadata);
	let metadatas = getSlicedData(totalSize, metadata);
	let oldMaps = getAllContainsMapKeys(db.map, "_sectionsMap");

	if (oldMaps.length >= metadatas.length) {
		for (let i = 0; i < oldMaps.length; i++) {
			const data = metadatas.length > i ? metadatas[i] : "-1";
			let mapName = `_sectionsMap[${surveyId}][${i}]`;
			await UpdateOrInsertData(mapName, data);
		}
	} else {
		for (let i = 0; i < metadatas.length; i++) {
			const data = metadatas[i];
			let mapName = `_sectionsMap[${surveyId}][${i}]`;
			await UpdateOrInsertData(mapName, data);
		}
	}
}
export async function CreateSurveyCategory(name, image) {
	let db = await getOutput();
	var obj = { category_id: 0, name: name, image: image };
	let _categoryMap = db.map.get("_categoryMap") !== undefined ? JSON.parse(db.map.get("_categoryMap")) : [];
	obj['category_id'] = _categoryMap.length;
	_categoryMap.push(obj);
	await UpdateOrInsertData('_categoryMap', JSON.stringify(_categoryMap));
}
export async function UpdateStudy(studyId, image, title, description, budget) {
	let db = await getOutput();
	let _studyMap = db.map.get("_studyMap") !== undefined ? JSON.parse(db.map.get("_studyMap")) : [];
	for (let i = 0; i < _studyMap.length; i++) {
		const element = _studyMap[i];
		if (studyId === element.studyId) {
			_studyMap[i].image = image;
			_studyMap[i].title = title;
			_studyMap[i].description = description;
			_studyMap[i].budget = budget;
		}
	}
	await UpdateOrInsertData('_studyMap', JSON.stringify(_studyMap));

}

export async function UpdateSurvey(surveyId, name, description, image, reward) {
	let db = await getOutput();
	let _surveyMap = db.map.get("_surveyMap") !== undefined ? JSON.parse(db.map.get("_surveyMap")) : [];
	for (let i = 0; i < _surveyMap.length; i++) {
		const element = _surveyMap[i];
		if (surveyId === element.surveyId) {
			_surveyMap[i].name = name;
			_surveyMap[i].description = description;
			_surveyMap[i].image = image;
			_surveyMap[i].reward = reward;
		}
	}
	await UpdateOrInsertData('_surveyMap', JSON.stringify(_surveyMap));

}

export async function UpdateReward(studyId, rewardType, rewardPrice, totalSpendingLimit) {
	let db = await getOutput();
	let _studyMap = db.map.get("_studyMap") !== undefined ? JSON.parse(db.map.get("_studyMap")) : [];
	for (let i = 0; i < _studyMap.length; i++) {
		const element = _studyMap[i];
		if (studyId === element.studyId) {
			_studyMap[i].rewardType = rewardType;
			_studyMap[i].rewardPrice = rewardPrice;
			_studyMap[i].totalSpendingLimit = totalSpendingLimit;
		}
	}
	await UpdateOrInsertData('_studyMap', JSON.stringify(_studyMap));

}

export async function UpdateAudience(studyId, audienceInfo) {
	let db = await getOutput();
	let _studyAudienceMap = db.map.get("_studyAudienceMap") !== undefined ? JSON.parse(db.map.get("_studyAudienceMap")) : [];
	let found = false;
	for (let i = 0; i < _studyAudienceMap.length; i++) {
		const element = _studyAudienceMap[i];
		if (studyId === element.studyId) {
			_studyAudienceMap[i].audienceInfo = audienceInfo;
			found = true;
		}
	}
	if (!found) {
		var obj = {
			studyId: studyId,
			audienceInfo: audienceInfo
		};
		_studyAudienceMap.push(obj);

	}
	await UpdateOrInsertData('_studyAudienceMap', JSON.stringify(_studyAudienceMap));

}

export async function UpdateUser(userId, image, credits) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userId === element.userId) {
			_userMap[i].image = image;
			_userMap[i].credits = credits;
		}
	}
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));

}

export async function UpdateFhir(userId, familyName, givenName, identifier, phone, gender, about, patient_id) {

	let db = await getOutput();
	let oldMaps = getAllContainsMapKeys(db.map, "_fhirMap");

	var obj = {
		fhir_id: userId,
		userId: userId,
		familyName: familyName,
		givenName: givenName,
		identifier: identifier,
		phone: phone,
		gender: gender,
		about: about,
		patientId: patient_id,
	};
	let metadata = JSON.stringify(obj);
	let totalSize = await getCurrentStringSize("_fhirMap", metadata);
	let metadatas = getSlicedData(totalSize, metadata);

	if (oldMaps.length >= metadatas.length) {
		for (let i = 0; i < oldMaps.length; i++) {
			const data = metadatas.length > i ? metadatas[i] : "-1";
			let mapName = `_fhirMap[${userId}][${i}]`;
			await UpdateOrInsertData(mapName, data);
		}
	} else {
		for (let i = 0; i < metadatas.length; i++) {
			const data = metadatas[i];
			let mapName = `_fhirMap[${userId}][${i}]`;
			await UpdateOrInsertData(mapName, data);
		}
	}

}

export async function CreateOngoingStudy(studyId, userId, date, givenPermission) {
	let db = await getOutput();
	var obj = {
		ongoingId: 0,
		studyId: studyId,
		userId: userId,
		date: date,
		givenPermission: givenPermission,
	};
	let _ongoingMap = db.map.get("_ongoingMap") !== undefined ? JSON.parse(db.map.get("_ongoingMap")) : [];
	let ongoingId = _ongoingMap.length;
	obj['ongoingId'] = ongoingId;
	_ongoingMap.push(obj);
	await UpdateOrInsertData('_ongoingMap', JSON.stringify(_ongoingMap));



	let _studyMap = db.map.get("_studyMap") !== undefined ? JSON.parse(db.map.get("_studyMap")) : [];
	for (let i = 0; i < _studyMap.length; i++) {
		const element = _studyMap[i];
		if (studyId === element.studyId) {
			_studyMap[i].contributors += 1;
		}
	}
	await UpdateOrInsertData('_studyMap', JSON.stringify(_studyMap));


}
export async function CreateQuestionAnswer(studyId, userId, surveyId, sectionId, questionId, answer) {
	let db = await getOutput();
	var obj = {
		answer_id: 0,
		studyId: studyId,
		userId: userId,
		surveyId: surveyId,
		sectionId: sectionId,
		questionId: questionId,
		answer: answer,
	};
	let _questionanswerdMap = db.map.get("_questionanswerdMap") !== undefined ? JSON.parse(db.map.get("_questionanswerdMap")) : [];
	let answer_id = _questionanswerdMap.length;
	obj['answer_id'] = answer_id;
	_questionanswerdMap.push(obj);
	await UpdateOrInsertData('_questionanswerdMap', JSON.stringify(_questionanswerdMap));

}


export async function CreateCompletedSurveys(surveyId, userId, date, studyId) {
	let db = await getOutput();
	var obj = {
		completedSurveyId: 0,
		studyId: studyId,
		userId: userId,
		surveyId: surveyId,
		date: date,
	};
	let _completedsurveyMap = db.map.get("_completedsurveyMap") !== undefined ? JSON.parse(db.map.get("_completedsurveyMap")) : [];
	let completedSurveyId = _completedsurveyMap.length;
	obj['completedSurveyId'] = completedSurveyId;
	_completedsurveyMap.push(obj);
	await UpdateOrInsertData('_completedsurveyMap', JSON.stringify(_completedsurveyMap));



	let _surveyMap = db.map.get("_surveyMap") !== undefined ? JSON.parse(db.map.get("_surveyMap")) : [];
	for (let i = 0; i < _surveyMap.length; i++) {
		const element = _surveyMap[i];
		if (surveyId === element.surveyId) {
			_surveyMap[i].submission += 1;
			_surveyMap[i].date += date;
		}
	}
	await UpdateOrInsertData('_surveyMap', JSON.stringify(_surveyMap));


}

export function getArgs(args) {
	let NewargsList = [];
	for (let i = 0; i < args.length; i++) {
		if (typeof args[i] === "string") {
			NewargsList.push(`"${args[i]}"`);
		} else if (typeof args[i] === "number") {
			NewargsList.push(args[i]);
		}
	}
	return NewargsList;
}
export function base64DecodeUnicode(base64String) {
	return Buffer.from(base64String, "base64").toString('utf8');
}
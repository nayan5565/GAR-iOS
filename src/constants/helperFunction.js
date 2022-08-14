import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { showMessage } from "react-native-flash-message";
import RNFetchBlob from "rn-fetch-blob";
import { refresh } from 'react-native-app-auth';
import { CLIENT_ID, MOBILE_REDIRECT_URL3 } from "./one_drive_credential";
import { exp } from "react-native-reanimated";

const showError = (msg) => {
    showMessage({
        message: msg,
        icon: 'danger',
        type: "danger",
    });
}
const showSuccess = (msg) => {
    showMessage({
        message: msg,
        icon: 'success',
        type: "success",
    });
}

export {
    showError,
    showSuccess
}

const config = {
    clientId: CLIENT_ID,
    redirectUrl: MOBILE_REDIRECT_URL3,
    scopes: ["User.Read", "Files.ReadWrite", "offline_access"],
    additionalParameters: { prompt: 'select_account' },
    serviceConfiguration: {
        authorizationEndpoint:
            'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    },
};

export const tokenRefresh = async () => {
    var refreshTokenData = await getData('refreshToken')
    console.log('refreshTokenData==>', refreshTokenData)
    const result = await refresh(config, {
        refreshToken: refreshTokenData,
    });
    await storeData('token', result.accessToken)
    await storeData('refreshToken', result.refreshToken)
    console.log('refresh==>', result.accessToken)
    return result.accessToken
}

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        console.log('store err==>', e)
        // saving error
    }
}

export const getData = async (key) => {
    var data;
    try {
        const value = await AsyncStorage.getItem(key)
        // console.log('store==>', value)
        if (value !== null) {
            data = value;
        } else data = 'No Data'

    } catch (e) {
        // error reading value
        data = 'err'
    }
    return data;
}

export const millisToMinutesAndSeconds = (millis) => {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return (seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" :
        "") + seconds);
}

export const secondsToHms = (d) => {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
}

export const secondsToHms2 = (d) => {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? ":" : ":") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? ":" : ":") : "00:";
    var sDisplay = s > 0 ? s + (s < 10 ? "0" : "") : "00";
    // return hDisplay + mDisplay + sDisplay;
    return (s == 60 ? (m + 1) + ":00" : (m < 10 ? "0" :
        "") + m + ":" + (s < 10 ? "0" :
            "") + s);
}

export const checkConnected = () => {
    return NetInfo.fetch().then((state) => {
        console.log("Connection type", state.type);
        console.log("Is connected?", state.isConnected);
        return state.isConnected;
    });
};

export const getUnique = (arr, index) => {

    const unique = arr
        .map(e => e[index])

        // store the keys of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)

        // eliminate the dead keys & store unique objects
        .filter(e => arr[e]).map(e => arr[e]);

    return unique;
}

export const ConvertToCSV = objArray => {
    var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    var str = "";

    for (var i = 0; i < array.length; i++) {
        var line = "";
        for (var index in array[i]) {
            if (line != "") line += ",";

            line += array[i][index];
        }

        str += line + "\r\n";
    }

    return str;
};

const uploadCsv = async (csvFile) => {
    var accessToken = await getData('token')
    var folderID = await getData('newFolderID')
    var newFolderId = folderID + ':/'
    // console.log('folderID==>', newFolderId)

    var isNetwork = await checkConnected()
    if (!isNetwork) {
        alert('Network connection lost!!')
        return
    }
    var fileName = await getData('csv_name')
    var folderName = fileName.split('.')[0]
    let tempDate = new Date()
    let fDate = (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + '-' + tempDate.getFullYear()
    let fTime = tempDate.getHours() + '-' + tempDate.getMinutes() + '-' + tempDate.getSeconds()
    let dateTime = fDate + '_' + fTime
    var amPm = 'AM'
    if (tempDate.getHours() > 11)
        amPm = 'PM'

    var csvFileName = folderName.toLocaleLowerCase() + '_' + dateTime + '_' + amPm + '.csv'
    console.log(csvFileName)
    // console.log('Image name==>', imageName)
    const path = csvFile;
    var url = 'https://graph.microsoft.com/v1.0/me/drive/items/' + newFolderId + csvFileName + ':/content'
    let response = await RNFetchBlob.fetch(
        "PUT",
        url,
        {
            Accept: "application/json",
            'Authorization': 'Bearer ' + accessToken,
            "Content-Type": "multipart/form-data"
        },
        RNFetchBlob.wrap(decodeURIComponent(path))
    );
    console.log('response.status==>', response.respInfo.status)
    // console.log('response===>', JSON.stringify(response))
    if (response.respInfo.status === 201) {
        alert('CSV successfully uploaded')
        return 'done'
    } else {
        //401 is expired token
        if (response.respInfo.status === 401) {
            alert('Token expired!!Please login again!!')
            // navigation.popToTop()
        } else if (response.respInfo.status === 404) {
            //404 is folder not found

        }
        return 'failed'
    }


}


export const writeCSV = async (csvDataList) => {
    try {

        var HEADER = 'PARCEL_ID,ADDRESS, PRINT_KEY, PROPERTY_CLASS, BUILD_STYLE, SFLA, LAT, LONG, PHOTOS_TAKEN, PHOTOS_UPLOADED,  ALL_PHOTOS_UPLOADED\n';

        const FILE_PATH = `${RNFetchBlob.fs.dirs.DownloadDir}/data.csv`;
        const csvString = `${HEADER}${ConvertToCSV(csvDataList)}`;
        RNFetchBlob.fs
            .writeFile(FILE_PATH, csvString, "utf8")
            .then(() => {
                console.log(`wrote file ${FILE_PATH}`);
                var status = uploadCsv(FILE_PATH)
                return 'success'
            })
            .catch(error => { alert(error); return 'error' });

    } catch (error) {
        // Error retrieving data
        return 'error'
    }
};

export const createCsv = () => {
    const values = [
        ['build', '2017-11-05T05:40:35.515Z'],
        ['deploy', '2017-11-05T05:42:04.810Z']
    ];

    // construct csvString
    const headerString = 'PARCEL_ID,ADDRESS, PRINT_KEY, PROPERTY_CLASS, BUILD_STYLE, SFLA, LAT, LONG, PHOTOS_TAKEN, PHOTOS_UPLOADED,  ALL_PHOTOS_UPLOADED\n';
    const rowString = values.map(d => `${d[0]},${d[1].address},'1','2','3','4','5','6',7,8,9\n`).join('');
    const csvString = `${headerString}${rowString}`;

    // write the current list of answers to a local csv file
    const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/data.csv`;
    console.log('pathToWrite', pathToWrite);
    // pathToWrite /storage/emulated/0/Download/data.csv
    RNFetchBlob.fs
        .writeFile(pathToWrite, csvString, 'utf8')
        .then(() => {
            console.log(`wrote file ${pathToWrite}`);
            // wrote file /storage/emulated/0/Download/data.csv
        })
        .finally(() => {
            console.log(`finally wrote file ${pathToWrite}`);
        })
        .catch(error => console.error(error));
}

export const createFolderApi = async () => {
    var folderID = ''
    var isNetwork = await checkConnected()
    if (!isNetwork) {
        alert('Network connection lost!!')
        return
    }

    var folderCreated = await getData('createdFolder')

    if (folderCreated == 'true') {
        console.log('Already have');
        folderID = await getData('newFolderID')

    } else {
        var fileName = await getData('csv_name')
        var folderName = fileName.split('.')[0]
        var token = await getData('token')
        // console.log('createFile token: ' + token);
        var rootUrl = 'https://graph.microsoft.com/v1.0/me/drive/root/children'
        var photoappUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:/photoapp:/children'

        var raw = JSON.stringify({
            "name": folderName.toLocaleLowerCase(),
            "folder": {},
            "@microsoft.graph.conflictBehavior": "rename"

        });
        try {
            const response = await fetch(photoappUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: raw,
            });
            const result = await response.json();
            console.log('createFile res: ' + response.status);
            if (response.status == 201) {
                console.log('createFile: ' + JSON.stringify(result));
                storeData('newFolderID', result.id)
                storeData('createdFolder', JSON.stringify(true))
                folderID = result.id

            } else if (response.status == 401) {
                console.log('token refresh:');
                var token = await tokenRefresh()
                createFolder()
                return
            } else {
                console.log('else err');
                folderID = 'No Folder'
            }
        } catch (error) {
            console.log('catch err');
            folderID = 'No Folder'
        }
    }
    return folderID
}
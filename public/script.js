//  This HTML script by ChatGPT, no UI focused  
// will replaced with reactjs application later (if i got time T_T)

const headers = {
    'Content-Type': 'application/json'
}

function switchTab(tabName) {
    var tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }

    var tabLabels = document.getElementsByClassName("tab-label");
    for (var i = 0; i < tabLabels.length; i++) {
        tabLabels[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName + "-label").classList.add("active");
}

function extractFileNameFromContentDisposition(contentDisposition) {
    var match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    var fileName = match && match[1];

    if (fileName) {
        // Remove any surrounding quotes from the file name
        fileName = fileName.replace(/['"]/g, '');
    }

    return fileName;
}

async function downloadYoutubeVideo() {
    document.getElementById("downloadYoutubeBtn").innerText = "Loading"
    document.getElementById("downloadYoutubeBtn").disabled = true

    try {
        const youtubeUrl = document.getElementById("youtubeUrl").value;
        const isAudioOnly = document.getElementById("audioOnly").checked;
        const requestParams = {
            url: youtubeUrl,
        }

        const response = await fetch("/youtube/get-info", {
            method: "POST",
            body: JSON.stringify(requestParams),
            headers: headers
        })

        const info = await response.json()

        const downloadVideo = await fetch(
            "http://localhost:5000/youtube/download",
            {
                method: "POST",
                body: JSON.stringify({
                    info: JSON.stringify(info),
                    isAudioOnly: isAudioOnly
                }),
                headers: headers
            }
        );

        const vidName = extractFileNameFromContentDisposition(downloadVideo.headers.get('Content-Disposition'))
        downloadVideo.headers.forEach(function (value, name) {
            console.log(name + ': ' + value);
        });

        const videoBlob = await downloadVideo.blob();
        const url = await URL.createObjectURL(videoBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = vidName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.log(error)
    } finally {
        document.getElementById("downloadYoutubeBtn").innerText = "Download"
        document.getElementById("downloadYoutubeBtn").disabled = false
    }
}

async function downloadPinterestVideo() {
    document.getElementById("downloadPinterestBtn").innerText = "Loading"
    document.getElementById("downloadPinterestBtn").disabled = true

    try {
        const pinterestUrl = document.getElementById("pinterestUrl").value;

        const downloadVideo = await fetch(
            "http://localhost:5000/pinterest/download",
            {
                method: "POST",
                body: JSON.stringify({
                    url: pinterestUrl,
                    videoType: "V_HLSV3_MOBILE"
                }),
                headers: headers
            }
        );

        const vidName = extractFileNameFromContentDisposition(downloadVideo.headers.get('Content-Disposition'))
        downloadVideo.headers.forEach(function (value, name) {
            console.log(name + ': ' + value);
        });

        const videoBlob = await downloadVideo.blob();
        const url = await URL.createObjectURL(videoBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = vidName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.log(error)
    } finally {
        document.getElementById("downloadPinterestBtn").innerText = "Download"
        document.getElementById("downloadPinterestBtn").disabled = false
    }
}
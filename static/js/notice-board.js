function getNoticeBoard() {
    requestNotice();
}

function requestNotice() {
    noticeRequest()
        .then(d => {
            console.log(d);
            displayNotice(d);
        })
        .catch(err => {
            hideNoticeBoard();
        })
}

function hideNoticeBoard() {
    document.getElementById("notice-board").style.display = "none";
}

function displayNotice(notice) {
    document.getElementById("notice-board-time").innerHTML = `
        ${getDateTimeToDisplay(notice.date)}
    `;
    document.getElementById("notice-board-message").innerHTML = notice.message;
}

function getDateTimeToDisplay(dateStr) {
    let fulldate = new Date(dateStr);
    let datePart = `${String(fulldate.getDate()).padStart(2, "0")}/${String(fulldate.getMonth() + 1).padStart(2, "0")}/${String(fulldate.getFullYear())}`;
    return `${datePart} - ${fulldate.toLocaleTimeString()}`
}
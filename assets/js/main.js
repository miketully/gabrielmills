const IMGS = 34
const CHANNELS = {
    paintings: { slug: "paintings-gabriel-mills", container: "painting-list" },
    installations: { slug: "installations-gabriel-mills-qjw7sudzywq", container: "installation-list" },
    videos: { slug: "videos-gabriel-mills", container: "video-list" },
    writing: { slug: "writing-gabriel-mills", container: "writing-list" }
}


// Utility function
function splitIntothree(num = 100) {
    const min = 20
    const max = 50
    const n1 = Math.floor(Math.random() * (max - min + 1)) + min  //24
    const n2 = Math.floor(Math.random() * (num - n1 - max + 1)) + min
    const n3 = num - n1 - n2
    return [n1, n2, n3]
}

// handlers
function handleHeader() {
    const res = []
    for (let i = 1; i < IMGS; i++) {
        let formattedNum = i < 10 ? '0' + i.toString() : i.toString();
        res.push(`./files/header/${formattedNum}.jpg`)
    }
    handleTriptych(res)
}

function handleTriptych(images) {
    const triptychs = document.querySelectorAll(".triptych")
    const dynamicWidth = splitIntothree()
    triptychs.forEach(t => {
        const randomImageIndx = Math.floor(Math.random() * images.length)
        const dw = dynamicWidth[dynamicWidth.length - 1];
        const imageURL = images[randomImageIndx];
        t.style.backgroundImage = `url(${imageURL})`;
        t.style.width = `${dw}vw`;
        // check the width of the background image and the container and adjust the width of the background image if the background image is smaller than the container width. 
        // getImageDimensions(imageURL)
        getBackgroundImageSize(t).then((data) => {
            const imgWidth = calcNewWidth(data.width, data.height, viewHightToPixels(88))
            if (imgWidth < viewWidthToPixels(dw)) {
                scaleBackgroundImage(t, 110)
            }
        })

        window.addEventListener('resize', () => {
            getBackgroundImageSize(t).then((data) => {
                const imgWidth = calcNewWidth(data.width, data.height, viewHightToPixels(88))
                if (imgWidth < viewWidthToPixels(dw)) {
                    scaleBackgroundImage(t, 110)
                }
            })
        })

        dynamicWidth.pop()
        images.splice(randomImageIndx, 1)
    })
}

function scaleBackgroundImage(element, scalePercentage) {
    const originalImage = new Image();
    originalImage.src = window.getComputedStyle(element).backgroundImage.slice(4, -1).replace(/"/g, "");

    originalImage.onload = function () {
        const originalWidth = originalImage.width;
        const originalHeight = originalImage.height;
        const scaledWidth = originalWidth * (scalePercentage / 100);
        const scaledHeight = originalHeight * (scalePercentage / 100);

        element.style.backgroundImage = `url(${originalImage.src})`;
        element.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
    }
}

function getBackgroundImageSize(elem) {
    let computedStyle = getComputedStyle(elem);
    let bgImage = computedStyle.backgroundImage;
    let bgImageUrl = bgImage.slice(4, -1).replace(/["']/g, "");
    let image = new Image();
    image.src = bgImageUrl;
    return new Promise((resolve) => {
        image.onload = function () {
            resolve({ width: image.width, height: image.height });
        };
    });
}

function calcNewWidth(elementWidth, elementHeight, newImageHeight) {
    const aspectRatio = elementWidth / elementHeight;
    return newImageHeight * aspectRatio;
}


function getImageDimensions(imageURl) {
    const img = new Image();
    img.src = imageURl;
    img.onload = function () {
        console.table(img.width, img.height)
    }
}

function viewWidthToPixels(viewWidth) {
    let widthInPixels = 0;

    // Get the viewport width
    let viewportWidth = window.innerWidth;

    // Convert view width to pixels
    widthInPixels = viewWidth * viewportWidth / 100;

    return widthInPixels;
}

function viewHightToPixels(viewHeight) {
    let heightInPixels = 0;

    // Get the viewport height
    let viewportHeight = window.innerHeight;

    // Convert view height to pixels
    heightInPixels = viewHeight * viewportHeight / 100;

    return heightInPixels;
}


// Get Data from Arena 
async function handleArenaContent(channel) {
    const randomString = Math.random().toString(16).slice(2)
    const contentUrl = `https://api.are.na/v2/channels/${channel}?sort=position&order=asc&per=100?noCache=${randomString}`
    return fetch(contentUrl).then(data => data.json())
}

async function renderTitle(slug, containerID, reverseOrder = false) {
    const data = await handleArenaContent(slug)
    const titleList = document.getElementById(containerID)
    const renderTitle = (title, chanelSlug) => {
        const li = document.createElement('li')
        const a = document.createElement('a')
        if (slug.includes("paintings")) {
            const slideHTML = "paintings.html"
            a.href = `./${slideHTML}?title=${title}`
        } else if (slug.includes("installations") && chanelSlug) {
            const slideHTML = "installations"
            a.href = `./${slideHTML}?title=${chanelSlug}`
        } else if (slug.includes("writing")) {
            const slideHTML = "writing"
            a.href = `./${slideHTML}?title=${title}`
        } else if (slug.includes("videos")) {
            const slideHTML = "videos"
            a.href = `./${slideHTML}?title=${sanitizeString(title)}`
        }
        a.textContent = title
        li.appendChild(a)
        titleList.append(li)
    }
    let contents = [...data.contents];
    contents = reverseOrder ? contents.reverse() : contents;

    contents.forEach(cnt => {
        renderTitle(cnt.title, cnt.slug)
    })
}


async function handleTitleList() {
    for (let channel in CHANNELS) {
        // let order = channel === "videos" ? false : true
        await renderTitle(CHANNELS[channel].slug, CHANNELS[channel].container, true)
    }
}

function sanitizeString(str) {
    return str.replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase();
}

const updateViewportHeight = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
}

window.onload = function () {
    handleHeader()
    handleTitleList()
    updateViewportHeight()
}
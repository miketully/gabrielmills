const CHANNEL = { slug: "writing-gabriel-mills", container: ".slideshow-frameText" };
const total = document.getElementById("total")
const frameTitle = document.querySelector(".slideshow-caption")

async function handleArenaContent(channel) {
        const randomString = Math.random().toString(16).slice(2)
        const contentUrl = `https://api.are.na/v2/channels/${channel}?sort=position&order=desc&per=100?nocache=${randomString}`
        return fetch(contentUrl).then(data => data.json())
}

async function renderTextFrames({slug, container}){
        const { contents } = await handleArenaContent(slug)
        contents.reverse()
        const containerElement = document.querySelector(container)
        total.textContent = contents.length
        
        contents.forEach((content, idx) => {
                if (content.class !== "Text") return
                const { title, content_html } = content
                let textWrapper = document.createElement("div")
                textWrapper.classList.add("text-wrapper")
                if (idx === 0) {
                        textWrapper.classList.add("active")
                        frameTitle.textContent = title
                }
                const textFrame = document.createElement("div")
                textFrame.classList.add("text-frame")
                textFrame.innerHTML = content_html
                textWrapper.appendChild(textFrame)
                containerElement.appendChild(textWrapper)
                
        })

        let cache = contents.reduce((acc, content) => {
                if (content.class !== "Text") return acc
                acc[content.title] = content.content_html
                return acc
        }, {});

        (localStorage.getItem("cache") === null) && localStorage.setItem("cache", JSON.stringify(cache))
}


function handleTextFrameSlider(){
        const frames = document.querySelectorAll(".text-wrapper")
        const nextButton = document.querySelector(".readright__btn")
        const prevButton = document.querySelector(".readleft__btn")
        const current = document.getElementById("current")
        const cache = JSON.parse(localStorage.getItem("cache"))
        const paramName = 'title'
        if (cache === null) return
        total.textContent = Object.keys(cache).length
        let currentFrame = 0
        current.textContent = currentFrame + 1

        function resetURL() {
                const url = new URL(window.location.href.toLowerCase())
                url.searchParams.delete(paramName)
                window.history.pushState({}, '', url)
        }

        function updateActiveFrame(offset){
                frames[currentFrame].classList.remove("active")
                currentFrame = (currentFrame + offset + frames.length) % frames.length
                current.textContent = currentFrame + 1
                frames[currentFrame].classList.add("active")
                frameTitle.textContent = Object.keys(cache)[currentFrame]
        }

        function showThisFrame(tile){
                resetURL()
                const index = Object.keys(cache).indexOf(tile)
                updateActiveFrame(index - currentFrame);
        }

        function nextButtonHandler(){
                updateActiveFrame(1)
        }

        function prevButtonHandler(){
                updateActiveFrame(-1)
        }

        function keyHandler(e){
                if (e.keyCode === 37) prevButtonHandler()
                if (e.keyCode === 39) nextButtonHandler()
        }

        function getURLParameter(name) {
                const url = new URL(window.location.href.toLowerCase())
                result = url.searchParams.get(name)
                if (!result) return
                result = result.replace(/['"]+/g, '')
                return result
        }

        const tile = getURLParameter(paramName)
        if (tile) showThisFrame(tile)

        nextButton.addEventListener("click", nextButtonHandler)
        prevButton.addEventListener("click", prevButtonHandler)
        document.addEventListener("keydown", keyHandler)

}

function slideTextFrames() {
        renderTextFrames(CHANNEL).then(() => {handleTextFrameSlider()})
}

window.onload = () => {
        slideTextFrames()
}
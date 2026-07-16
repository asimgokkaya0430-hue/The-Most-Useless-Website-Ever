/*
========================================

The Most Useless Website Ever

script.js

Part 1

========================================
*/

/*
========================================

Theme System

========================================
*/

function applyTheme(){

    const theme = localStorage.getItem("theme");

    document.body.classList.remove("classic");

    if(theme === "classic"){

        document.body.classList.add("classic");

    }

}

document.addEventListener("DOMContentLoaded", applyTheme);

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // Toast
    // -----------------------------

    const toast = document.getElementById("toast");

    function showToast(message){

        if(!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(window.toastTimeout);

        window.toastTimeout = setTimeout(()=>{

            toast.classList.remove("show");

        },2500);

    }

    // Make available everywhere
    window.showToast = showToast;

    // -----------------------------
    // Random Messages
    // -----------------------------

    const randomMessages = [

        "Nothing happened.",

        "Still nothing.",

        "Absolutely nothing.",

        "You clicked a button.",

        "Mission accomplished... somehow.",

        "Loading nothing...",

        "Done.",

        "Nope.",

        "Try clicking again.",

        "Error 418: I'm a teapot.",

        "This button is trying its best.",

        "Have you tried not clicking?",

        "The server looked busy doing nothing.",

        "Nothing was successfully completed."

    ];

    function randomToast(){

        const message = randomMessages[
            Math.floor(Math.random()*randomMessages.length)
        ];

        showToast(message);

    }

    // -----------------------------
    // Homepage Buttons
    // -----------------------------

    const nothingButton =
        document.getElementById("nothingButton");

    if(nothingButton){

        nothingButton.onclick=()=>{

            showToast("You did nothing.");

        };

    }

    const stillNothingButton =
        document.getElementById("stillNothingButton");

    if(stillNothingButton){

        stillNothingButton.onclick=()=>{

            showToast("Still absolutely nothing.");

        };

    }

    const dontClickButton =
        document.getElementById("dontClickButton");

    if(dontClickButton){

        dontClickButton.onclick=()=>{

            showToast("We literally told you not to.");

        };

    }

    const randomButton =
        document.getElementById("randomButton");

    if(randomButton){

        randomButton.onclick=randomToast;

    }

    // -----------------------------
    // Contact Form
    // -----------------------------

    const contactForm =
        document.getElementById("contactForm");

    if(contactForm){

        contactForm.addEventListener("submit",(e)=>{

            e.preventDefault();

            showToast(
                "Your message was successfully sent to nowhere."
            );

            contactForm.reset();

        });

    }

    // -----------------------------
    // Panic Button
    // -----------------------------

    const panicButton =
        document.getElementById("panicButton");

    if(panicButton){

        const panicMessages=[

            "PANIC!",

            "Actually... don't panic.",

            "Everything is fine.",

            "Nothing exploded.",

            "404 confirmed.",

            "Still not found.",

            "You made it worse."

        ];

        panicButton.onclick=()=>{

            panicButton.textContent=

            panicMessages[
                Math.floor(
                    Math.random()*panicMessages.length
                )
            ];

        };

    }

    // -----------------------------
    // Logo Easter Egg
    // -----------------------------

    const logo=document.querySelector(".logo");

    if(logo){

        let clicks=0;

        logo.onclick=()=>{

            clicks++;

            if(clicks===10){

                showToast(
                    "Achievement unlocked: Persistent."
                );

                clicks=0;

            }

        };

    }

});

/*
========================================

Part 2
Easter Eggs

========================================
*/

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // Kitten Popup
    // -----------------------------

    const overlay = document.getElementById("kittenOverlay");
    const kitten = document.getElementById("kittenImage");
    const closeKitten = document.getElementById("closeKitten");

    let kCounter = 0;

    document.addEventListener("keydown", (event) => {

        if(event.key.toLowerCase() === "k"){

            kCounter++;

            if(kCounter >= 5){

                if(overlay){

                    overlay.classList.remove("hidden");

                }

                if(window.showToast){

                    window.showToast(
                        "🐈 Secret unlocked: Maine Coon Kitten"
                    );
                }

                kCounter = 0;

            }

        }else{

            kCounter = 0;

        }

    });

    if(closeKitten){

        closeKitten.onclick = () => {

            overlay.classList.add("hidden");

        };

    }

    if(overlay){

        overlay.addEventListener("click",(e)=>{

            if(e.target===overlay){

                overlay.classList.add("hidden");

            }

        });

    }

    if(kitten){

        kitten.onclick = () => {

            if(window.showToast){

                window.showToast(
                    "You clicked the kitten. It appreciated nothing."
                );

            }

        };

    }

    // -----------------------------
    // Konami Code
    // -----------------------------

    const konami = [

        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "b",
        "a"

    ];

    let konamiIndex = 0;

    document.addEventListener("keydown",(event)=>{

        if(event.key === konami[konamiIndex]){

            konamiIndex++;

            if(konamiIndex===konami.length){

                if(window.showToast){

                    window.showToast(
                        "Congratulations. You expected something."
                    );

                }

                konamiIndex=0;

            }

        }else{

            konamiIndex=0;

        }

    });

    // -----------------------------
    // CAT Secret
    // -----------------------------

    let catWord="";

    document.addEventListener("keydown",(event)=>{

        catWord += event.key.toUpperCase();

        if(catWord.length>3){

            catWord=catWord.slice(-3);

        }

        if(catWord==="CAT"){

            if(window.showToast){

                window.showToast(
                    "Meow."
                );

            }

            catWord="";

        }

    });

    // -----------------------------
    // ESC
    // -----------------------------

    document.addEventListener("keydown",(event)=>{

        if(event.key==="Escape"){

            if(window.showToast){

                window.showToast(
                    "You cannot escape nothing."
                );

            }

        }

    });

    // -----------------------------
    // U x10
    // -----------------------------

    let uCounter=0;

    document.addEventListener("keydown",(event)=>{

        if(event.key.toLowerCase()==="u"){

            uCounter++;

            if(uCounter===10){

                if(window.showToast){

                    window.showToast(
                        "Ultimate Uselessness Achieved."
                    );

                }

                uCounter=0;

            }

        }else{

            uCounter=0;

        }

    });

    // -----------------------------
    // Double Click Title
    // -----------------------------

    const title=document.querySelector(".hero h1");

    if(title){

        const original=title.innerHTML;

        title.addEventListener("dblclick",()=>{

            title.innerHTML=
            "The Slightly More Useless Website Ever";

            setTimeout(()=>{

                title.innerHTML=original;

            },2500);

        });

    }

    // -----------------------------
    // Right Click
    // -----------------------------

    document.addEventListener("contextmenu",(event)=>{

        if(window.showToast){

            window.showToast(
                "You found the context menu."
            );

        }

    });

});

/*
========================================

Part 3
Final Easter Eggs

========================================
*/

document.addEventListener("DOMContentLoaded", () => {

    // =============================
    // Achievement Popup
    // =============================

    function achievement(title, text){

        const popup = document.createElement("div");

        popup.className = "achievementPopup";

        popup.innerHTML = `
            <h2>🏆 ${title}</h2>
            <p>${text}</p>
        `;

        document.body.appendChild(popup);

        setTimeout(()=>{
            popup.classList.add("show");
        },50);

        setTimeout(()=>{
            popup.classList.remove("show");

            setTimeout(()=>{
                popup.remove();
            },500);

        },3500);

    }

    // =============================
    // Legendary Persistence
    // =============================

    const logo = document.querySelector(".logo");

    if(logo){

        let clicks = 0;

        logo.addEventListener("click",()=>{

            clicks++;

            if(clicks===100){

                achievement(

                    "Legendary Persistence",

                    "You clicked the logo 100 times."

                );

                clicks = 0;

            }

        });

    }

    // =============================
    // Cat Walk
    // =============================

    let catCode = "";

    document.addEventListener("keydown",(event)=>{

        catCode += event.key.toUpperCase();

        if(catCode.length>3){

            catCode = catCode.slice(-3);

        }

        if(catCode==="CAT"){

            const cat=document.createElement("div");

            cat.textContent="🐈";

            cat.style.position="fixed";
            cat.style.left="-80px";
            cat.style.bottom="30px";
            cat.style.fontSize="60px";
            cat.style.zIndex="999999";
            cat.style.transition="12s linear";

            document.body.appendChild(cat);

            setTimeout(()=>{

                cat.style.left="110%";

            },100);

            setTimeout(()=>{

                cat.remove();

            },12500);

            catCode="";

        }

    });

    // =============================
    // Fake Loading Screen
    // =============================

    function fakeLoading(){

        const loader=document.createElement("div");

        loader.style.position="fixed";
        loader.style.inset="0";
        loader.style.background="#09090b";
        loader.style.display="flex";
        loader.style.flexDirection="column";
        loader.style.justifyContent="center";
        loader.style.alignItems="center";
        loader.style.zIndex="999999";

        loader.innerHTML=`

        <h1 style="margin-bottom:20px;">
        Loading...
        </h1>

        <div style="
        width:320px;
        height:16px;
        background:#222;
        border-radius:20px;
        overflow:hidden;
        ">

        <div id="fakeBar"

        style="
        width:0%;
        height:100%;
        background:linear-gradient(90deg,#6d7cff,#8b5cf6);
        transition:3s;
        ">

        </div>

        </div>

        <p style="margin-top:25px;color:#aaa;">

        Preparing absolutely nothing...

        </p>

        `;

        document.body.appendChild(loader);

        const bar=loader.querySelector("#fakeBar");

        setTimeout(()=>{

            bar.style.width="100%";

        },100);

        setTimeout(()=>{

            loader.querySelector("p").textContent=

            "Finished loading absolutely nothing.";

        },3000);

        setTimeout(()=>{

            loader.remove();

        },4500);

    }

    // =============================
    // F11 Secret
    // =============================

    document.addEventListener("keydown",(event)=>{

        if(event.key==="F11"){

            if(window.showToast){

                window.showToast(

                    "Fullscreen Nothing Unlocked."

                );

            }

        }

    });

    // =============================
    // Developer Mode
    // =============================

    let dev="";

    document.addEventListener("keydown",(event)=>{

        dev+=event.key.toUpperCase();

        if(dev.length>3){

            dev=dev.slice(-3);

        }

        if(dev==="DEV"){

            achievement(

                "Developer Mode",

                "There isn't one."

            );

            dev="";

        }

    });

    // =============================
    // Extra Random Messages
    // =============================

    if(window.randomMessages){

        window.randomMessages.push(

            "404 not found.",

            "Your click has been ignored professionally.",

            "Still loading... nope.",

            "Nothing has been upgraded.",

            "Achievement: Clicking.",

            "That accomplished almost something.",

            "Everything is functioning incorrectly correctly.",

            "Congratulations?",

            "Your expectations have been reset.",

            "Please clap."

        );

    }

    // Theme Switcher
function setTheme(theme) {
    if (theme === "classic") {
        document.body.classList.add("classic-theme");
        localStorage.setItem("theme", "classic");
    } else {
        document.body.classList.remove("classic-theme");
        localStorage.setItem("theme", "modern");
    }
}

// Load saved theme
window.addEventListener("load", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "classic") {
        document.body.classList.add("classic-theme");
    }
});

    // =============================
    // Secret Loading
    // =============================

    document.addEventListener("keydown",(event)=>{

        if(event.shiftKey && event.key==="L"){

            fakeLoading();

        }

    });

});
const {Telegraf,Composer,session,WizardScene,Stage} = require('micro-bot')
const fs = require('fs')
const path = require('path')
const svg2img = require('svg2img')
const svgCaptcha = require('svg-captcha')

// const bot = new Telegraf('5664553037:AAFGAwBIkrE5A4zrmimZG3WdfntePX9jljA')
const bot = new Composer()


bot.use(session())

const chooseOption = `<b>Choose a option</b> \n
1. I am an online vendor, ready to sell my products/services on Web3 while my profits appreciate!
I will bring my clientele with me to build this community!

2. I am an online shopper, ready to browse and buy my favorite products/services on Web3, while my money appreciates in my wallet!
I will bring my favorite vendors with me to build this community!

3. I am an artist/musician, ready to sell my artworks on Web3 while my profits and royalties appreciate!
I will bring my audience with me to build this community!

4. I am a crypto/NFT enthusiast, ready to collect and trade while my profits appreciate!
I will help build this community!
`

bot.start(ctx=>{
    ctx.reply("hi")
})


const newUserScene = new WizardScene('newUserScene', 

    async ctx=>{

        ctx.session = {}

        ctx.session.userId = ctx.from.id
        ctx.session.name = ctx.from.first_name

        ctx.session.type_captcha = ctx.update.message.text

        const cap = svgCaptcha.create()
        
        const svg = cap.data
        const captchaValue = cap.text

        svg2img(svg,(e,b)=>{
            fs.writeFileSync(ctx.chat.id+".png",b)
            ctx.session.gen_captcha = captchaValue
            ctx.replyWithPhoto({source: fs.readFileSync(ctx.chat.id+'.png') }).catch(e=>console.log(e))
        })

        return ctx.wizard.next()

    },
    ctx=>{
    
        ctx.session.type_captcha = ctx.update.message.text

        if(ctx.session.userId == ctx.from.id){

            if(ctx.session.type_captcha == ctx.session.gen_captcha){

                //image delete
                fs.rmSync(ctx.chat.id+".png",{ force: true})
                
                ctx.telegram.sendMessage(ctx.chat.id, chooseOption, {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: "1",callback_data: '1'},{text: "2",callback_data: '2'},{text: "3",callback_data: '3'},{text: "4",callback_data: '4'}]
                        ]
                    },
                    parse_mode: "HTML"
                })
                .catch(e=>console.log(e))
    
                return ctx.wizard.next()
    
            }else{
                
                //image delete
                fs.rmSync(ctx.chat.id+".png",{ force: true})

                return ctx.scene.reenter()
    
            }
        }


    },
    ctx=>{

        // ctx.session.optionValue = ctx.update.message.text
        
        if(ctx.session.userId == ctx.from.id){

            ctx.telegram.sendMessage(ctx.chat.id, `Please join the channel \n\nhttps://t.me/BazaarWeb3NFTChannel`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: "I HAVE JOINED THE BAZAAR WEB3 CHANNEL", callback_data: "joined"}]
                    ]
                }
            })
            return ctx.wizard.next()
        }

    },
    ctx=>{

        if(ctx.session.userId == ctx.from.id){
            console.log(ctx.session)

            


            return ctx.scene.leave()
        }
    }
)


const stage = new Stage([newUserScene])

bot.use(stage.middleware())



bot.on('new_chat_members',ctx=>{
    ctx.scene.enter('newUserScene')
})

bot.command('test',ctx=>{
    ctx.scene.enter('newUserScene')
})


// bot.launch()
// .then(()=>console.log("bot running"))
// .catch(e=>console.log(e))

module.exports = bot

const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require("@notionhq/client")

function isHex ( id ) {
    var re = /[0-9A-Fa-f]{32}/g;
    return re.test(id);
}

async function Do()
{
    try 
    {
        const contextJson = core.getInput('context');
        const context = JSON.parse(contextJson)

        for (commit of context.event.commits)
        {
            const URL = commit.url;    
            const SHA = commit.id.slice(0, 7);
            const message = commit.message;
            console.log(message);

            const notionKey = core.getInput('notionToken');
            const notion = new Client({
                auth: notionKey,
            })   

            words = message.match(/\b(\w+)\b/g);

            const pageIds = words.filter((elem) => isHex(elem) );
            console.log("Page IDS:");
            console.log(pageIds);

            for (const pageId of pageIds) 
            {
                const response = await notion.pages.update({
                    page_id: pageId,
                    properties: {
                    Status: {
                        status: { name: "Done" }
                    },
                    Commit:{
                        rich_text: 
                        [
                            {
                                text: {
                                    content: SHA,
                                    link: { url: URL }
                                },
                            }
                        ]
                    }
                    },
                });
                
                console.log(response);
            }
        }
    } 
    catch (error) 
    {
        core.setFailed(error.message);
    }
}

Do();
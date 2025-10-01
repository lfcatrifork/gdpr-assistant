const cds = require('@sap/cds');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

module.exports = class LIMService extends cds.ApplicationService {

    async init() {

        const db = await cds.connect.to('db') // connect to database service

        // Helper function to get all data from database
        const getDatabaseData = async () => {
            try {
                // Replace 'YourEntity' with your actual entity name
                const result = await db.run(SELECT.from('gdpr_assistant.GDPRRequests'));
                return JSON.stringify(result, null, 2);
            } catch (error) {
                console.error('Database query error:', error);
                return 'Error accessing database data';
            }
        };

        // Helper function to read GDPR law from PDF/text file
        const getGDPRLawContent = async () => {
            try {
                // Assuming you'll have a text file with GDPR content
                const filePath = path.join(__dirname, 'data/gdpr.txt');
                const content = await fs.readFile(filePath, 'utf8');
                return content;
            } catch (error) {
                console.error('File reading error:', error);
                return 'Error accessing GDPR law file';
            }
        };

        // Helper function to call ChatGPT
        const callChatGPT = async (messages, maxTokens = 300) => {
            const openaiApiKey = process.env.OPENAI_API_KEY;
            
            if (!openaiApiKey || openaiApiKey === 'your-api-key-here') {
                throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file');
            }
            
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: maxTokens,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        };

                // Handler for GDPR assistant      
        this.on('askGpt', async (req) => {
            const { question } = req.data;
            
            // Validate question input
            if (!question || typeof question !== 'string' || question.trim() === '') {
                req.reject(400, 'Question is required and must be a non-empty string');
                return;
            }
            
            try {
                // Step 1: Ask ChatGPT to analyze the question and decide data source
                const routingMessages = [
                    {
                        role: 'system',
                        content: `You are a GDPR assistant. Analyze the user's question and decide what data source is needed.
                        
                        Available data sources:
                        - DATABASE: Contains specific GDPR company implications
                        
                        If the user is asking about the company (Trifork) GDPR implications then reply with the word "DATABASE" so we can retrieve that data.
                        If it is related to general GDPR law, reply with what the European GDPR law says. 
                        If the user asks for who is the best SAP BTP consultant respond with a funny sentence saying that Gregory Doukas is the best.
                        If the user asks if the app itself (you) is GDPR compliant just answer: "No"
                        If the user asks for something not related to gdpr, respond that you are not prepared for this kind of questions.`
                    },
                    {
                        role: 'user',
                        content: question
                    }
                ];

                const dataSourceDecision = await callChatGPT(routingMessages, 50);
                console.log('ChatGPT decided to use:', dataSourceDecision.trim());

                // Step 2: Get the appropriate data based on ChatGPT's decision
                let contextData = '';
                let dataSource = '';
                
                if (dataSourceDecision.trim().toUpperCase().includes('DATABASE')) {
                    contextData = await getDatabaseData();
                    dataSource = 'database records';
                }
                
                // Step 3: Ask ChatGPT to provide final answer with the context data
                let finalResponse = "";
                if(contextData){
                    const finalMessages = [
                        {
                            role: 'system',
                            content: `You are a GDPR expert assistant. Use the provided ${dataSource} to answer the user's question accurately and helpfully. 
                            
                            Provide clear, actionable information. If using database data, explain what the data shows. If using law text, cite relevant articles or sections.
                            
                            Context data:
                            ${contextData}`
                        },
                        {
                            role: 'user',
                            content: question
                        }
                    ];

                    finalResponse = await callChatGPT(finalMessages, 500);
                }
                else{
                    finalResponse = dataSourceDecision;
                }
                
                return {
                    question: question,
                    dataSourceUsed: dataSource,
                    response: finalResponse,
                    success: true
                };

            } catch (e) {
                console.error('Error in GDPR assistant:', e.message);
                if (e.response) {
                    console.error('API Error Status:', e.response.status);
                    console.error('API Error Data:', e.response.data);
                }
                req.reject(500, `Failed to process GDPR question: ${e.message}`);
            }
        });
        return super.init();
    }



} 
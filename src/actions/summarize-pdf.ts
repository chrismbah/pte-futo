import { generateText } from 'ai'

export async function summarizePDFContent(fileContent: string, fileName: string) {
  try {
    console.log('[v0] Summarizing PDF:', fileName)
    
    if (!fileContent || fileContent.trim().length === 0) {
      throw new Error('File content is empty')
    }
    
    // Use ChatGPT 5nano - the best AI model for premium features
    const result = await generateText({
      model: 'openai/gpt-5-nano',
      system: 'You are an expert at summarizing educational documents. Provide a clear, concise summary highlighting key concepts and important information.',
      prompt: `Summarize this document content:\n\n${fileContent}\n\nProvide:\n1. A brief overview (2-3 sentences)\n2. Key concepts (bulleted list)\n3. Important takeaways\n4. Recommended study points`,
    })

    console.log('[v0] Summary generated successfully')
    return result.text
  } catch (error) {
    console.error('[v0] Error summarizing PDF:', error)
    const errorMsg = error instanceof Error ? error.message : 'Failed to summarize PDF content'
    throw new Error(`PDF Summarization Error: ${errorMsg}`)
  }
}

export async function generateExamQuestionsFromPDF(fileContent: string, fileName: string, topicArea: string = 'general') {
  try {
    console.log('[v0] Generating exam questions from PDF:', fileName)
    
    if (!fileContent || fileContent.trim().length === 0) {
      throw new Error('File content is empty')
    }
    
    // Use ChatGPT 5nano - the best AI model for premium features
    const result = await generateText({
      model: 'openai/gpt-5-nano',
      system: 'You are an expert educator creating exam questions based on document content. Generate questions that test understanding of key concepts.',
      prompt: `Based on this educational document, generate 5 multiple choice exam questions:\n\n${fileContent}\n\nFormat each question as:\nQ{number}: [Question]\nA) [Option A]\nB) [Option B]\nC) [Option C]\nD) [Option D]\nAnswer: [Correct letter]\nExplanation: [Brief explanation]\n\nTopic: ${topicArea}`,
    })

    console.log('[v0] Questions generated successfully')
    return result.text
  } catch (error) {
    console.error('[v0] Error generating questions:', error)
    const errorMsg = error instanceof Error ? error.message : 'Failed to generate exam questions'
    throw new Error(`Exam Questions Error: ${errorMsg}`)
  }
}

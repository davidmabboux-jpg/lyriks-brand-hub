import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
const t = new StdioClientTransport({ command: 'node', args: ['index.mjs'] })
const c = new Client({ name: 'test', version: '1' })
await c.connect(t)
const tools = await c.listTools()
console.log('TOOLS:', tools.tools.map(x => x.name).join(', '))
const call = async (n, a = {}) => { const r = await c.callTool({ name: n, arguments: a }); return r.content[0].text }
console.log('get_calendar →', await call('get_calendar'))
console.log('add →', await call('add_publication', { segment: 'David Mabboux', thematique: 'ROI du dev assisté par IA', title: 'TEST MCP publication', date: '2026-08-12', status: 'VALIDATED' }))
const listRaw = await c.callTool({ name: 'list_publications', arguments: { segment: 'David', status: 'VALIDATED' } })
const created = listRaw.structuredContent.publications.find(p => p.title === 'TEST MCP publication')
console.log('list found:', JSON.stringify(created))
console.log('update →', await call('update_publication', { id: created.id, status: 'PUBLISHED' }))
console.log('delete →', await call('delete_publication', { id: created.id }))
await c.close()
console.log('OK')

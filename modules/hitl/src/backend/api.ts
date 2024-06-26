import { Config } from '../config'

import { SDK } from '.'
import Database from './db'
import { SessionIdentity } from './typings'

export default async (bp: SDK, db: Database) => {
  const router = bp.http.createRouterForBot('hitl')

  router.get('/sessions', async (req, res) => {
    const pausedOnly = req.query.pausedOnly === 'true'
    const sessionIds = req.query.searchText && (await db.searchSessions(req.query.searchText))

    res.send(await db.getAllSessions(pausedOnly, req.params.botId, sessionIds))
  })

  router.get('/sessions/:sessionId', async (req, res) => {
    const messages = await db.getSessionMessages(req.params.sessionId)
    res.send(messages)
  })

  router.post('/sessions/:sessionId/message', async (req, res) => {
    const session = await db.getSessionById(req.params.sessionId)

    if (!session) {
      return res.sendStatus(404)
    }

    let type = req.body.typee;
    if (type === 'messageText') {
      type = 'text';
    }

    let payload = {
      agent: true,
      text: req.body.message,
      preview: req.body.message,
      type: type,
      metadata: {
        __markdown: true,
        __typing: true
      }
    }

    if (type == 'location') {
      payload["location"] = { "latitude": req.body.latitude, "longitude": req.body.longitude };
      payload["preview"] = req.body.message;
      payload["text"] = req.body.message;
    }
    if (type == 'image') {
      payload["url"] = req.body.url;
    }

    if (session.channel == 'dialog360' && type == 'image') {
      payload["image"] = req.body.url;
      payload["title"] = req.body.message;
    }

    await bp.events.sendEvent(
      bp.IO.Event({
        type: 'text',
        channel: session.channel,
        target: session.userId,
        botId: req.params.botId,
        direction: 'outgoing',
        payload: payload
      })
    )

    res.sendStatus(200)
  })

  router.post('/sessions/:sessionId/isPaused', async (req, res) => {
    res.send(await db.isSessionPaused({ sessionId: req.params.sessionId }))
  })

  router.post('/channel/:channel/user/:userId/isPaused', async (req, res) => {
    const { botId, channel, userId } = req.params
    res.send(await db.isSessionPaused({ botId, channel, userId }))
  })

  const changePauseState = async (isPaused: boolean, targetUser: SessionIdentity, trigger: string = 'operator') => {
    const sessionId = await db.setSessionPauseState(isPaused, targetUser, trigger)

    bp.realtime.sendPayload(bp.RealTimePayload.forAdmins('hitl.session', { id: sessionId }))
    bp.realtime.sendPayload(bp.RealTimePayload.forAdmins('hitl.session.changed', { id: sessionId, isPaused }))
  }

  router.post('/sessions/:sessionId/:action', async (req, res) => {
    const { sessionId, action, trigger } = req.params
    await changePauseState(action === 'pause', { sessionId }, trigger)
    res.sendStatus(200)
  })

  router.post('/channel/:channel/user/:userId/:action', async (req, res) => {
    const { botId, channel, userId, action, trigger } = req.params
    await changePauseState(action === 'pause', { botId, channel, userId }, trigger)
    res.sendStatus(200)
  })

  router.get('/config/attributes', async (req, res) => {
    try {
      const config = (await bp.config.getModuleConfigForBot('hitl', req.params.botId)) as Config
      res.send(config.attributes)
    } catch (err) {
      res.status(400).send(`Can't find attributes: ${err.message}`)
    }
  })
}

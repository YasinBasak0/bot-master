import { lang } from 'botpress/shared'
import React, { FC } from 'react'
import { Alert, Card, CardBody, CardText, CardTitle } from 'reactstrap'

import logo from '../../media/nobg_white.png'

interface Props {
  title?: string
  subtitle?: React.ReactNode
  error?: string | null
  poweredBy?: boolean
  children: React.ReactNode
}

export const LoginContainer: FC<Props> = props => {
  return (
    <div className="centered-container">
      <div className="middle">
        <div className="inner">
          <img className="logo" src={logo} alt="loading" />
          <Card body>
            <CardBody className="login-box">
              <div>
                <CardTitle>
                  <strong>{props.title || 'Qbot'}</strong>
                </CardTitle>
                <CardText>{props.subtitle || ''}</CardText>
                {props.error && <Alert color="danger">{props.error}</Alert>}
                {props.children}
              </div>
            </CardBody>
          </Card>
          {props.poweredBy && (
            <div className="homepage">
              <p>
                {lang.tr('admin.poweredBy')} <a href="https://qbot.com.tr/tr">Qbot</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

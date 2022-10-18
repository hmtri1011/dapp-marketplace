import React, { useEffect } from 'react'
import { Box, Button } from '@mantine/core'

import { hooks, metaMask } from 'connectors/metamask'
import { getAddChainParameters } from 'chain'

export interface HomeProps {}

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

const Home: React.FC<HomeProps> = () => {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  console.log('ahihihi', chainId, accounts, isActivating, isActive, provider, ENSNames)

  // attempt to connect eagerly on mount
  useEffect(() => {
    const autoConnect = async () => {
      try {
        await metaMask.connectEagerly()
        console.log('Auto connect')
      } catch {
        console.debug('Failed to connect eagerly to metamask')
      }
    }

    autoConnect()
  }, [])

  const handleConnect = () => {
    metaMask.activate(getAddChainParameters(3))
  }

  return (
    <Box>
      <Box>Home</Box>
      <Button onClick={handleConnect}>Connect Wallet</Button>
    </Box>
  )
}

export default Home

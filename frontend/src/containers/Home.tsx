import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useProvider, useSigner } from 'wagmi'
import axios from 'axios'

import { NFTItem } from 'types'
import { chainId, marketplaceAddress } from 'config'
import marketplaceAbi from 'abis/marketplace.json'

export interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  const provider = useProvider({
    chainId
  })
  const { data: signer, isLoading } = useSigner()

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const contract = new ethers.Contract(marketplaceAddress, marketplaceAbi, provider)
    const data = await contract.fetchMarketItems()

    console.log('ahihi data', data)

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(
      data.map(async (i: any) => {
        const tokenUri = await contract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item: NFTItem = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description
        }
        return item
      })
    )

    setNfts(items)
    setLoadingState('loaded')
  }

  async function buyNft(nft: any) {
    if (signer) {
      /* needs the user to sign the transaction, so will use Web3Provider and sign it */
      const contract = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer)

      /* user will be prompted to pay the asking proces to complete the transaction */
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price
      })
      await transaction.wait()
      loadNFTs()
    }
  }

  useEffect(() => {
    loadNFTs()
  }, [])

  if (loadingState === 'loaded' && !nfts.length) {
    return <h1 className='px-20 py-10 text-3xl'>No items in marketplace</h1>
  }

  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: '1600px' }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {nfts.map((nft, i) => (
            <div key={i} className='border shadow rounded-xl overflow-hidden'>
              <img src={nft.image} />
              <div className='p-4'>
                <p style={{ height: '64px' }} className='text-2xl font-semibold'>
                  {nft.name}
                </p>
                <div style={{ height: '70px', overflow: 'hidden' }}>
                  <p className='text-gray-400'>{nft.description}</p>
                </div>
              </div>
              <div className='p-4 bg-black'>
                <p className='text-2xl font-bold text-white'>{nft.price} ETH</p>
                <button
                  className='mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded'
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home

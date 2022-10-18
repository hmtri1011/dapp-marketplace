import React, { useState } from 'react'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useNavigate } from '@tanstack/react-location'
import { useAccount, useSigner } from 'wagmi'
import { ethers } from 'ethers'
import { Buffer } from 'buffer'

import { WalletConnect } from 'components'
import { ipfsProjectId, ipfsProjectSecret, marketplaceAddress } from 'config'
import marketplaceAbi from 'abis/marketplace.json'

const projectIdAndSecret = `${ipfsProjectId}:${ipfsProjectSecret}`

const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(projectIdAndSecret).toString('base64')}`
  }
})

export interface CreateNFTProps {}

export const CreateNFT: React.FC<CreateNFTProps> = () => {
  const { address, isConnected } = useAccount()
  const { data: signer, isLoading } = useSigner()

  const [fileUrl, setFileUrl] = useState('')
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const navigate = useNavigate()

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    /* upload image to IPFS */
    const file = e.target.files?.[0]
    if (file) {
      try {
        const added = await client.add(file, {
          progress: prog => console.log(`received: ${prog}`)
        })

        const url = `https://hmtri1011.infura-ipfs.io/ipfs/${added.path}`

        client.pin.add(added.path).then(res => {
          console.log('ahiuhi res added', res, added)
          setFileUrl(url)
        })
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
    }
  }

  const uploadToIPFS = async () => {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl
    })
    try {
      const added = await client.add(data)
      console.log('ahhi added', added)
      const url = `https://hmtri1011.infura-ipfs.io/ipfs/${added.path}`
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function listNFTForSale() {
    if (signer) {
      const url = await uploadToIPFS()

      /* create the NFT */
      const price = ethers.utils.parseUnits(formInput.price, 'ether')
      let contract = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer)
      let listingPrice = await contract.getListingPrice()
      listingPrice = listingPrice.toString()
      let transaction = await contract.createToken(url, price, { value: listingPrice })
      await transaction.wait()

      navigate({
        to: '/',
        replace: true
      })
    }
  }

  if (!isConnected) {
    return <WalletConnect />
  }

  return (
    <div className='flex justify-center'>
      <div className='w-1/2 flex flex-col pb-12'>
        <input
          placeholder='Asset Name'
          className='mt-8 border rounded p-4'
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder='Asset Description'
          className='mt-2 border rounded p-4'
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder='Asset Price in Eth'
          className='mt-2 border rounded p-4'
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input type='file' name='Asset' className='my-4' onChange={onChange} />
        {fileUrl && <img className='rounded mt-4' width='350' src={fileUrl} />}
        <button onClick={listNFTForSale} className='font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg'>
          Create NFT
        </button>
      </div>
    </div>
  )
}

export default CreateNFT

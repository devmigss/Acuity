import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedS3Url, setUploadedS3Url] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Quick validation
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    
    setError('')
    setSelectedFile(file)
    // Create a local preview
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError('')
    setUploadedS3Url('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      // Get the JWT token from the Cognito Session
      const token = user?.cognitoSession?.getAccessToken().getJwtToken()

      const response = await fetch('http://localhost:3000/api/uploads/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image to S3')
      }

      // 2. Save the new AWS S3 URL to the PostgreSQL Database
      const dbResponse = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarUrl: data.fileUrl })
      })

      if (!dbResponse.ok) {
        throw new Error('Image uploaded, but failed to save to database.')
      }

      setUploadedS3Url(data.fileUrl)
    } catch (err) {
      console.error(err)
      setError(err.message || 'An error occurred during upload.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-12 animate-fade-in">
      <PageHeader title="Profile & Settings" subtitle="Manage your account preferences and test AWS S3 uploads." />
      
      <div className="mt-8 bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-surface-100">
          <h3 className="text-lg font-bold text-surface-900">Profile Picture</h3>
          <p className="mt-1 text-sm text-surface-500">Upload a new avatar to test the AWS S3 pipeline.</p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-200 text-sm text-danger-700">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-surface-100 flex items-center justify-center">
                {previewUrl || uploadedS3Url ? (
                  <img src={previewUrl || uploadedS3Url} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-surface-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col gap-4 w-full sm:w-auto">
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden" 
                />
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto shadow-2xs"
                >
                  Choose Image
                </Button>
                <p className="mt-2 text-xs text-surface-400">Recommended size: 256x256px. JPG, PNG, or WEBP.</p>
              </div>

              {selectedFile && (
                <div className="pt-4 border-t border-surface-100">
                  <Button 
                    type="button" 
                    variant="primary" 
                    onClick={handleUpload}
                    loading={isUploading}
                    className="w-full sm:w-auto font-bold bg-[#0B1F3A] hover:bg-[#071527] shadow-xs"
                  >
                    {isUploading ? 'Uploading to AWS S3...' : 'Upload to Cloud'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Success State */}
          {uploadedS3Url && (
            <div className="mt-8 p-5 bg-emerald-50 rounded-xl border border-emerald-200 animate-scale-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-emerald-900">Successfully Uploaded!</h4>
              </div>
              <p className="text-sm text-emerald-800 ml-11">
                Your image is now live on Amazon S3. Here is your public URL:
              </p>
              <div className="ml-11 mt-3 p-3 bg-white rounded-lg border border-emerald-100 shadow-sm text-xs text-surface-600 break-all font-mono">
                <a href={uploadedS3Url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {uploadedS3Url}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

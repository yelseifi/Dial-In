'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AuthDrawer from '../components/auth/authDrawer';
import { useStytchToken } from '../lib/useStytchToken';
import { uploadVideo, uploadVideoForMiami } from '../lib/s3';
import SuccessDrawer from './components/success';


export default function MiamiMusicWeekPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [artistName, setArtistName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [isSuccessDrawerOpen, setIsSuccessDrawerOpen] = useState(false);

  const setIsAuthDrawerClosed = () => {
    setIsAuthDrawerOpen(false);
    window.scrollTo(0, 0);
  }
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const sessionToken = useStytchToken();
  
  // Set page as loaded after a short delay for animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };
  
  const handleSuccessDrawerClose = (action: 'upload' | 'dashboard') => {
    setIsSuccessDrawerOpen(false);
    if (action === 'upload') {
    // Reset form for a new upload
    setVideoFile(null);
    setArtistName('');
    // Focus the file input after a short delay
    setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 300);
    } else if (action === 'dashboard') {
      router.push('/dashboard');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !artistName) return;

    if (!sessionToken) {
      setIsAuthDrawerOpen(true);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Upload the video
      const result = await uploadVideoForMiami(videoFile);
      console.log('Video uploaded to S3:', result);

      // Create the claim
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          artists: [artistName],
          dateSeeing: new Date(),
          videoUrl: result.url,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create claim');
      }

      // Show success drawer on successful upload and claim creation
      setIsSuccessDrawerOpen(true);
    } catch (error) {
      console.error('Error submitting video:', error);
      alert('There was an error uploading your video. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-900 to-black text-white font-['Montserrat',sans-serif] overflow-x-hidden">
      {/* Miami Music Week Header */}
      <div className="relative overflow-hidden h-[32vh] min-h-[160px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          {/* Background video or dynamic background effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-red-950/80 z-10"></div>
          
          {/* Animated pulse effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3], 
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="w-[120%] h-[120%] rounded-full bg-red-600/20 blur-3xl"
            />
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="container mx-auto px-4 relative z-30 text-center"
        >
          <div className="space-y-6">
            <motion.h1 
              initial={{ letterSpacing: "0.05em" }}
              animate={{ letterSpacing: "0.08em" }}
              transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-black tracking-wider uppercase mb-4 text-white drop-shadow-lg"
            >
              MIAMI MUSIC WEEK
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ duration: 0.8, delay: 1 }}
              className="h-1 bg-red-500 mx-auto"
            />
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-xl md:text-3xl font-bold text-red-300 tracking-wider"
            >
              Get Paid for Videos of Unreleased Music
            </motion.p>
          </div>
        </motion.div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">  

        <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
              />
              
              {/* Video upload button/area */}
              <div className="flex flex-col items-center">
  <motion.button
    type="button"
    onClick={triggerFileInput}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full p-8 rounded-xl border-2 border-dashed ${
      videoFile ? 'bg-red-800/20 border-red-400' : 'bg-black/20 border-red-800/50 hover:border-red-400'
    } transition-colors flex flex-col items-center justify-center relative overflow-hidden`}
  >
    <div className="relative z-10 flex flex-col items-center justify-center text-center">
      {videoFile ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex justify-center items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <p className="text-lg font-medium mb-1">Video Selected</p>
          <p className="text-sm text-gray-300">{videoFile.name}</p>
        </>
      ) : (
        <>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="flex justify-center items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </motion.div>
          <p className="text-lg font-medium mb-1 tracking-wide">UPLOAD VIDEO</p>
          <p className="text-sm text-gray-300">Tap to select a video</p>
        </>
      )}
    </div>
                  
                  {/* Animated background element */}
                  {!videoFile && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 -skew-x-12"
                      animate={{ x: [-200, 500] }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.button>
              </div>
              
              {/* Artist field */}
              <div>
                <motion.label 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.6 }}
                  htmlFor="artistName" 
                  className="block text-lg font-bold mb-2 tracking-wide"
                >
                  WHICH DJ WAS PLAYING?
                </motion.label>
                <motion.input
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.8 }}
                  type="text"
                  id="artistName"
                  placeholder="Enter DJ/Artist Name"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full px-4 py-4 bg-black/40 border border-red-800/50 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500 backdrop-blur-sm"
                  required
                />
              </div>
              
              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={!videoFile || !artistName || isSubmitting}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 2 }}
                className={`w-full py-5 px-6 text-xl font-bold rounded-xl transition-all duration-300 ${
                  !videoFile || !artistName || isSubmitting
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 shadow-lg shadow-red-900/40'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    UPLOADING...
                  </div>
                ) : (
                  'SUBMIT VIDEO TO GET PAID'
                )}
              </motion.button>
              
              {/* Terms link */}
              
            </motion.form>
          {/* Main CTA Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-gradient-to-br from-red-900/80 to-red-950/80 backdrop-blur-lg rounded-3xl p-8 md:p-10 shadow-2xl mb-12 border border-red-800/30 overflow-hidden relative mt-12"
          >
            {/* Abstract background elements */}
            <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-red-500/10 blur-xl"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-red-500/10 blur-xl"></div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-4xl md:text-5xl font-black tracking-wide mb-8 text-center uppercase leading-tight"
            >
              TAKE VIDEOS,
              <span className="block text-red-400">GET PAID</span>
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex items-center justify-between px-2 mb-8 w-full py-2 overflow-x-visible"
            >
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="flex flex-col items-center text-center w-16"
              >
                <div className="w-12 h-12 rounded-full bg-red-700/50 flex items-center justify-center mb-2 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Record</p>
              </motion.div>
              
              
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
           
              
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="flex flex-col items-center text-center w-16"
              >
                <div className="w-12 h-12 rounded-full bg-red-700/50 flex items-center justify-center mb-2 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Upload</p>
              </motion.div>
              
              
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             
              
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="flex flex-col items-center text-center w-16"
              >
                <div className="w-12 h-12 rounded-full bg-red-700/50 flex items-center justify-center mb-2 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Get Paid</p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-black/30 p-6 rounded-xl mb-8 backdrop-blur-sm border border-red-800/20"
            >
              <p className="text-lg md:text-xl text-center font-medium leading-relaxed">
                If our algorithm matches your video with an unreleased track, 
                the artist will pay you for capturing the moment!
              </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 2.2 }}
                className="text-center"
              >
                <button 
                  type="button" 
                  onClick={() => setShowTerms(true)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium tracking-wide mb-4"
                >
                  Terms & Conditions
                </button>
              </motion.div>
            
            
          </motion.div>
          
          {/* How it works section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="bg-gradient-to-br from-black to-red-950/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-red-900/20"
          >
            <h3 className="text-2xl font-bold mb-8 text-center tracking-wide uppercase">HOW IT WORKS</h3>
            
            <div className="space-y-8">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="flex items-start"
              >
                <div className="bg-red-900/50 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <span className="font-bold">1</span>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium">Record a video of a DJ playing at a Miami Music Week event</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.7 }}
                className="flex items-start"
              >
                <div className="bg-red-900/50 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <span className="font-bold">2</span>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium">Upload the video on this page (minimum 20 seconds)</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.9 }}
                className="flex items-start"
              >
                <div className="bg-red-900/50 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <span className="font-bold">3</span>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium">Our algorithm will analyze if the track is unreleased</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 2.1 }}
                className="flex items-start"
              >
                <div className="bg-red-900/50 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <span className="font-bold">4</span>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium">If matched, the artist will pay you directly through our platform</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {showTerms && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-gradient-to-br from-red-950 to-black rounded-xl w-full max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto border border-red-800/30 shadow-2xl"
            >
              <button
                onClick={() => setShowTerms(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-red-900/30 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h3 className="text-2xl font-bold mb-6 tracking-wide">Terms & Conditions</h3>
              
              <div className="space-y-4 text-gray-300">
                <p className="font-medium">By uploading a video, you agree to the following terms:</p>
                
                <ul className="list-disc pl-5 space-y-3">
                  <li>You must be the original creator of the uploaded video content.</li>
                  <li>Your video must be at least 20 seconds long and clearly capture the audio of the performance.</li>
                  <li>Our algorithm will analyze the audio to match it with our database of unreleased tracks.</li>
                  <li>Payment is only processed if the algorithm successfully matches the video with an unreleased track and the artist approves the claim.</li>
                  <li>Payments typically range from $20-$100 depending on the artist and the quality of the video.</li>
                  <li>By uploading, you grant us a non-exclusive license to use the video for promotional purposes.</li>
                  <li>You must create an account to receive payment.</li>
                  <li>Miami Music Week special rates apply from March 24-30, 2025 only.</li>
                </ul>
                
                <p>For more information, please read our full <Link href="/terms" className="text-red-400 hover:text-red-300 font-medium">Terms of Service</Link> and <Link href="/privacy" className="text-red-400 hover:text-red-300 font-medium">Privacy Policy</Link>.</p>
              </div>
              
              <motion.button
                onClick={() => setShowTerms(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-4 px-4 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-medium rounded-lg transition-colors shadow-lg"
              >
                I Understand
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={setIsAuthDrawerClosed}
        onAuthSuccess={setIsAuthDrawerClosed}
        extraText="Sign In To Finish Uploading"
      />

      <AnimatePresence>
        <SuccessDrawer
          isOpen={isSuccessDrawerOpen}
          onClose={handleSuccessDrawerClose}
        />
      </AnimatePresence>          
    </main>
  
  );
}
// src/components/Results.jsx
import React, { useContext, useState, useEffect } from 'react'; // Add useEffect
import PropTypes from 'prop-types';
import Confetti from 'react-confetti';
import { useAuth } from '../context/AuthContext';
import { saveQuizResult } from '../services/firebase';

const Results = ({
	score = 0,
	totalQuestions = 10,
	topic = 'Quiz',
	difficulty = 'intermediate',
	onNewQuiz,
	onNavigate,
	pendingResult,
	setPendingResult
}) => {
	console.log('Auth:', useAuth()); // Debug auth context
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState(null);
	const [saved, setSaved] = useState(false);

	const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
	const isExcellentScore = percentage >= 90;

	const googleColors = [
		'#4285F4', '#DB4437', '#F4B400', '#0F9D58',
	];

	const { user, login } = useAuth();

	// Add useEffect for auto-save
	useEffect(() => {
		const autoSaveResult = async () => {
			if (!user) return;

			try {
				await saveQuizResult(user.uid, {
					topic,
					score,
					totalQuestions,
					difficulty
				});
			} catch (error) {
				console.error('Failed to save result:', error);
			}
		};

		autoSaveResult();
	}, []); // Run once when component mounts

	useEffect(() => {
		const saveAfterLogin = async () => {
			if (user && pendingResult && !saved) {
				try {
					await saveQuizResult(user.uid, pendingResult);
					setSaved(true);
					setPendingResult(null);
				} catch (error) {
					setSaveError('Failed to save result');
					console.error('Save error:', error);
				}
			}
		};
		saveAfterLogin();
	}, [user, pendingResult]);

	const handleSignIn = async () => {
		try {
			await login();
			// Result will be auto-saved by useEffect
		} catch (error) {
			console.error('Login error:', error);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col">
			{isExcellentScore && (
				<Confetti
					recycle={false}
					numberOfPieces={300}
					gravity={0.3}
					colors={googleColors}
					tweenDuration={5000}
					width={window.innerWidth}
					height={window.innerHeight}
				/>
			)}
			{/* Header */}
			<div className="px-4 md:px-8 py-6">
				<div className="flex items-center space-x-2">
					<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
						<span className="text-white font-bold text-xl">Q</span>
					</div>
					<h1 className="text-2xl font-bold text-blue-800">QuizzyAI</h1>
				</div>
			</div>

			{/* Results Card */}
			<div className="flex-grow flex items-center justify-center px-4 md:px-8 py-8">
				<div className="w-full max-w-lg">
					<div className="bg-white rounded-2xl shadow-xl p-8 text-center">
						<h2 className="text-3xl font-bold text-blue-900 mb-6">Quiz Complete!</h2>

						{/* Score Circle */}
						<div className="w-48 h-48 mx-auto mb-8 relative">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="text-center">
									<div className="text-5xl font-bold text-blue-600">{percentage}%</div>
									<div className="text-blue-800 mt-2">Score</div>
								</div>
							</div>
							<svg className="w-full h-full" viewBox="0 0 100 100">
								<circle
									cx="50"
									cy="50"
									r="45"
									fill="none"
									stroke="#EBF5FF"
									strokeWidth="10"
								/>
								<circle
									cx="50"
									cy="50"
									r="45"
									fill="none"
									stroke="#2563EB"
									strokeWidth="10"
									strokeDasharray={`${percentage * 2.83} 283`}
									transform="rotate(-90 50 50)"
								/>
							</svg>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-2 gap-4 mb-8">
							<div className="bg-blue-50 rounded-xl p-4">
								<div className="text-blue-800">Correct Answers</div>
								<div className="text-2xl font-bold text-blue-900">
									{score} / {totalQuestions}
								</div>
							</div>
							<div className="bg-blue-50 rounded-xl p-4">
								<div className="text-blue-800">Topic</div>
								<div className="text-2xl font-bold text-blue-900 truncate">
									{topic}
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
							<button
								onClick={() => onNavigate('welcome')}  // New home button
								className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Back to Home
							</button>
							<button
								onClick={() => onNavigate('profile')}
								className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								View Profile
							</button>
							<button
								onClick={onNewQuiz}
								className="px-6 py-3 border-2 border-blue-600 text-blue-700 bg-transparent rounded-lg hover:bg-blue-50 transition-colors"
							>
								New Quiz
							</button>
						</div>

						{/* Auth/Save Section */}
						<div className="mt-6 space-y-4">
							{!user && (
								<div className="p-4 bg-blue-50 rounded-lg text-center">
									<p className="text-blue-800 mb-2">Sign in to save your progress</p>
									<button
										onClick={handleSignIn}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
									>
										Sign in with Google
									</button>
								</div>
							)}

							{saved && (
								<div className="text-green-600 font-medium">
									Result saved successfully!
								</div>
							)}

							{saveError && (
								<div className="text-red-600 font-medium">
									{saveError}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

Results.propTypes = {
	score: PropTypes.number.isRequired,
	totalQuestions: PropTypes.number.isRequired,
	topic: PropTypes.string.isRequired,
	difficulty: PropTypes.string,
	onNewQuiz: PropTypes.func.isRequired,
	onNavigate: PropTypes.func.isRequired,
	pendingResult: PropTypes.object,
	setPendingResult: PropTypes.func
};

export default Results;
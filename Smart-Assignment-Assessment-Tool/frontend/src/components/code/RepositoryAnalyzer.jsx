import React, { useState } from 'react';
import { Card } from 'flowbite-react';
import { CodeBracketIcon, FolderIcon, DocumentTextIcon, LightBulbIcon } from '@heroicons/react/24/outline';

import NamingConventionAnalyzer from './NamingConventionAnalyzer';
import CodeNamingConventionAnalyzer from './CodeNamingConventionAnalyzer';
import CodeCommentsAccuracyAnalyzer from './CodeCommentsAccuracyAnalyzer';

const RepositoryAnalyzer = ({ github_url, code_id }) => {
  const [activeAnalyzer, setActiveAnalyzer] = useState(null);

  const analyzerCards = [
    {
      id: 'file-naming',
      title: 'File Naming Convention Analysis',
      description: 'Check if your repository files follow standard naming conventions for their respective programming languages.',
      icon: <FolderIcon className="h-12 w-12 text-amber-600" />,
      component: NamingConventionAnalyzer,
      gradient: 'from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700',
      buttonColor: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800'
    },
    {
      id: 'naming-convention',
      title: 'Code Naming Convention Analysis',
      description: 'Analyze your codebase for proper naming conventions across variables, functions, classes, and more.',
      icon: <CodeBracketIcon className="h-12 w-12 text-primary-600" />,
      component: CodeNamingConventionAnalyzer,
      gradient: 'from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700',
      buttonColor: 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800'
    },
    {
      id: 'code-comments',
      title: 'Code Comments Analysis',
      description: 'Analyze the accuracy and quality of code comments across your repository, ensuring they properly match implementation.',
      icon: <LightBulbIcon className="h-12 w-12 text-emerald-600" />,
      component: CodeCommentsAccuracyAnalyzer,
      gradient: 'from-emerald-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800'
    }
  ];

  // If an analyzer is active, render it
  if (activeAnalyzer) {
    const AnalyzerComponent = activeAnalyzer.component;
    return <AnalyzerComponent github_url={github_url} code_id={code_id} onBack={() => setActiveAnalyzer(null)} />;
  }

  // Otherwise, render the card selection
  return (
    <div className="container mx-auto px-4 py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Repository Analysis Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze your GitHub repository at <span className="font-medium text-primary-600 dark:text-primary-400">{github_url}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyzerCards.map((card) => (
          <div key={card.id} className="transform transition-all duration-300 hover:scale-105">
            <Card className={`h-full overflow-hidden border-none shadow-lg bg-gradient-to-br ${card.gradient} cursor-pointer`}
                  onClick={() => setActiveAnalyzer(card)}>
              <div className="flex flex-col h-full p-2">
                <div className="flex items-center mb-4">
                  {card.icon}
                  <h2 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">{card.title}</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow">{card.description}</p>
                <button
                  className={`${card.buttonColor} text-white font-medium rounded-lg text-sm px-5 py-2.5 w-full transition-all duration-200 transform hover:translate-y-1 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900`}
                >
                  Launch Analysis
                </button>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About Repository Analysis</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Our analysis tools help you maintain high-quality code by checking naming conventions, 
          comment accuracy, and overall code quality. Choose any of the tools above to get started 
          with analyzing your repository.
        </p>
      </div>
    </div>
  );
};

export default RepositoryAnalyzer;
import React, { useState } from "react";
import { motion } from "framer-motion";

const Analytics = () => {
    const analyticsData = {
        "confusion_matrix": {
            title: "Confusion Matrix",
            image: new URL('../assets/confusion_matrix.png', import.meta.url).href,
            description: `The matrix shows the model's predictions vs actual outcomes:
                • True Negatives (578): Correctly predicted no flood
                • False Positives (77): Incorrectly predicted flood when there wasn't one
                • False Negatives (42): Incorrectly predicted no flood when there was one
                • True Positives (233): Correctly predicted flood
                
                This suggests the model is fairly accurate but has some bias toward false positives.`
        },
        "model_performance": {
            title: "Model Performance Metrics",
            image: new URL('../assets/model_performance_metrics.png', import.meta.url).href,
            description: `• Accuracy (~0.87): Shows the model correctly classifies about 87% of all cases
                • Precision (~0.75): Of all predicted floods, about 75% were actual floods
                • Recall (~0.85): The model correctly identifies about 85% of actual flood events
                • F1-Score (~0.80): The harmonic mean of precision and recall, indicating good overall balance`
        },
        "precision_recall": {
            title: "Precision-Recall Curve",
            image: new URL('../assets/precision_recall_curve.png', import.meta.url).href,
            description: `This graph shows the tradeoff between precision and recall at different classification thresholds.
                
                The curve maintains high precision (>0.8) until about 0.8 recall, then drops sharply.
                This indicates the model performs well until it tries to capture the last 20% of flood cases, where precision deteriorates significantly.`
        },
        "roc_curve": {
            title: "ROC Curve",
            image: new URL('../assets/roc_curve.png', import.meta.url).href,
            description: `The Area Under the Curve (AUC) = 0.90, indicating excellent discriminative ability.
                The curve shows strong performance in balancing true positives against false positives.
                It significantly outperforms random chance (represented by the diagonal dashed line).`
        },
        "shap": {
            title: "SHAP Feature Importance",
            image: new URL('../assets/shap_feature_importance.png', import.meta.url).href,
            description: `This shows the relative impact of each feature on predictions:
                • 3-day average precipitation (prcp_avg_3d) has the highest impact
                • Blockage is the second most important feature
                • Single-day precipitation (prcp) has the least impact
                
                Understanding these factors helps improve model interpretability and decision-making.`
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                        Model Analytics & Insights
                    </h1>
                </motion.div>

                <div className="space-y-12">
                    {Object.entries(analyticsData).map(([key, data], index) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    {data.title}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="relative group">
                                        <motion.img
                                            src={data.image}
                                            alt={data.title}
                                            className="rounded-lg shadow-md w-full h-auto cursor-pointer"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-gray-600 whitespace-pre-line">
                                            {data.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-12 bg-white rounded-xl shadow-lg p-6 md:p-8"
                >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conclusion</h2>
                    <p className="text-gray-600">
                        This suggests that sustained rainfall (3-day average) is a better predictor of flooding than single-day precipitation, 
                        and blockages in the gutter system significantly influence flood risk. The model performs well overall but tends to be 
                        slightly conservative, preferring false positives over missing actual flood events.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;


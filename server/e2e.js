import axios from 'axios';
const API_BASE = 'http://localhost:5000/api';
async function runTests() {
    console.log('--- Starting API E2E Tests ---');
    let releaseId;
    try {
        console.log('1. Create Release -> Review Brief -> Approve -> Final Brief');
        const createRes = await axios.post(`${API_BASE}/releases`, {
            title: 'E2E Test Release',
            version: 'v1.0.0',
            description: 'Testing the whole flow',
            items: [
                { itemId: 'FEAT-001', type: 'feature', description: 'New feature', qaEvidence: 'Passed', userImpact: 'High' },
                { itemId: 'FIX-001', type: 'fix', description: 'Bug fix', qaEvidence: 'Passed', userImpact: 'Low' }
            ]
        });
        releaseId = createRes.data._id;
        console.log('   - Created Release:', releaseId);
        console.log('   - Waiting for AI processing...');
        let release;
        while (true) {
            const getRes = await axios.get(`${API_BASE}/releases/${releaseId}`);
            release = getRes.data;
            if (release.analysisStatus !== 'processing' && release.analysisStatus !== 'pending') {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        console.log(`   - AI Status: ${release.analysisStatus}`);
        if (release.analysisStatus === 'failed') {
            console.log('   - AI failed, triggering retry...');
            await axios.post(`${API_BASE}/releases/${releaseId}/retry-analysis`);
            while (true) {
                const getRes = await axios.get(`${API_BASE}/releases/${releaseId}`);
                release = getRes.data;
                if (release.analysisStatus !== 'processing' && release.analysisStatus !== 'pending')
                    break;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            console.log(`   - AI Status after retry: ${release.analysisStatus}`);
        }
        if (release.analysisStatus !== 'completed') {
            throw new Error('AI analysis did not complete successfully.');
        }
        const statementsRes = await axios.get(`${API_BASE}/releases/${releaseId}/statements`);
        const statements = statementsRes.data;
        console.log(`   - Generated ${statements.length} statements.`);
        if (statements.length > 0) {
            console.log(`   - Approving statement ${statements[0]._id}`);
            await axios.put(`${API_BASE}/releases/statements/${statements[0]._id}`, { reviewStatus: 'approved' });
        }
        if (statements.length > 1) {
            console.log(`   - Rejecting statement ${statements[1]._id}`);
            await axios.put(`${API_BASE}/releases/statements/${statements[1]._id}`, { reviewStatus: 'rejected' });
        }
        const finalRes = await axios.get(`${API_BASE}/releases/${releaseId}/final-brief`);
        const finalStatements = finalRes.data;
        console.log(`   - Final Brief contains ${finalStatements.length} statements.`);
        const hasRejected = finalStatements.some((s) => s.reviewStatus === 'rejected');
        if (hasRejected)
            throw new Error('Final Brief contains rejected statements!');
        console.log('\n2. Create New Version');
        const newVersionRes = await axios.post(`${API_BASE}/releases/${releaseId}/new-version`, {
            title: 'E2E Test Release Updated',
            version: 'v1.1.0',
            description: 'Testing new version flow',
            items: [
                { itemId: 'FEAT-001', type: 'feature', description: 'New feature', qaEvidence: 'Passed', userImpact: 'High' },
                { itemId: 'FIX-001', type: 'fix', description: 'Bug fix updated', qaEvidence: 'Failed', userImpact: 'Medium' },
                { itemId: 'FEAT-002', type: 'feature', description: 'Another feature', qaEvidence: 'Passed', userImpact: 'Low' }
            ]
        });
        const newReleaseId = newVersionRes.data._id;
        console.log(`   - Created New Version: ${newReleaseId}`);
        console.log('   - Waiting for AI processing on new version...');
        let newRelease;
        while (true) {
            const getRes = await axios.get(`${API_BASE}/releases/${newReleaseId}`);
            newRelease = getRes.data;
            if (newRelease.analysisStatus !== 'processing' && newRelease.analysisStatus !== 'pending')
                break;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        console.log(`   - AI Status for New Version: ${newRelease.analysisStatus}`);
        const oldStatementsRes = await axios.get(`${API_BASE}/releases/${releaseId}/statements`);
        const staleStatements = oldStatementsRes.data.filter((s) => s.isStale);
        console.log(`   - Old version now has ${staleStatements.length} stale statements.`);
        const newStatementsRes = await axios.get(`${API_BASE}/releases/${newReleaseId}/statements`);
        console.log(`   - New version has ${newStatementsRes.data.length} statements.`);
        console.log('\n3. Version History');
        const historyRes = await axios.get(`${API_BASE}/releases/${newReleaseId}/history`);
        console.log(`   - History contains ${historyRes.data.length} versions.`);
        if (historyRes.data.length !== 2)
            throw new Error('History should contain exactly 2 versions.');
        console.log('\n✅ ALL E2E TESTS PASSED!');
    }
    catch (err) {
        console.error('\n❌ E2E TEST FAILED:');
        if (err.response) {
            console.error(err.response.data);
        }
        else {
            console.error(err.message);
        }
    }
}
runTests();
//# sourceMappingURL=e2e.js.map
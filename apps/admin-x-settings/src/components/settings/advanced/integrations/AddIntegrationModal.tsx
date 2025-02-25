import Form from '../../../../admin-x-ds/global/form/Form';
import LimitModal from '../../../../admin-x-ds/global/modal/LimitModal';
import Modal from '../../../../admin-x-ds/global/modal/Modal';
import NiceModal, {useModal} from '@ebay/nice-modal-react';
import React, {useEffect, useState} from 'react';
import TextField from '../../../../admin-x-ds/global/form/TextField';
import useRouting from '../../../../hooks/useRouting';
import {HostLimitError, useLimiter} from '../../../../hooks/useLimiter';
import {modalRoutes} from '../../../providers/RoutingProvider';
import {useCreateIntegration} from '../../../../api/integrations';

interface AddIntegrationModalProps {}

const AddIntegrationModal: React.FC<AddIntegrationModalProps> = () => {
    const modal = useModal();
    const {updateRoute} = useRouting();
    const [name, setName] = useState('');
    const {mutateAsync: createIntegration} = useCreateIntegration();
    const limiter = useLimiter();

    useEffect(() => {
        if (limiter?.isLimited('customIntegrations')) {
            limiter.errorIfWouldGoOverLimit('customIntegrations').catch((error) => {
                if (error instanceof HostLimitError) {
                    NiceModal.show(LimitModal, {
                        prompt: error.message || `Your current plan doesn't support more custom integrations.`
                    });
                    modal.remove();
                    updateRoute('integrations');
                }
            });
        }
    }, [limiter, modal, updateRoute]);

    return <Modal
        afterClose={() => {
            updateRoute('integrations');
        }}
        okColor='black'
        okLabel='Add'
        size='sm'
        testId='add-integration-modal'
        title='Add integration'
        onOk={async () => {
            const data = await createIntegration({name});
            modal.remove();
            updateRoute({route: modalRoutes.showIntegration, params: {id: data.integrations[0].id}});
        }}
    >
        <div className='mt-5'>
            <Form
                marginBottom={false}
                marginTop={false}
            >
                <TextField
                    placeholder='Custom integration'
                    title='Name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </Form>
        </div>
    </Modal>;
};

export default NiceModal.create(AddIntegrationModal);
